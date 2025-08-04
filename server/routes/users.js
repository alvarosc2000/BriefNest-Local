const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();
const db = require('../db');

const {
  createUser,
  loginUser,
  updateUserPlan,
  buyExtraBrief,
  getUserPlan,
  getUserById,
  authenticateToken,
  getUserPlanWithExpirationCheck,
  updateUserPlanAfterPayment,
  updateUserBriefsAfterPayment
} = require('../controllers/userController');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Rutas de usuario
router.post('/register', createUser);
router.post('/login', loginUser);
router.put('/:userId/plan', updateUserPlan);
router.put('/:userId/buy-brief', authenticateToken, buyExtraBrief);
router.get('/:userId/info-plan', getUserPlanWithExpirationCheck);
router.get('/:userId', getUserById);

// Crear sesión de pago para comprar briefs extra
router.post('/:userId/briefs/checkout-session', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Cantidad inválida' });
  }

  try {
    const result = await db.query(
      'SELECT subscription_plan FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const plan = result.rows[0].subscription_plan;
    const pricesByPlan = {
      básico: 700,
      basic: 700,
      pro: 500,
      premium: 300,
      equipo: 300
    };

    const unitAmount = pricesByPlan[plan?.toLowerCase()] || 700;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Compra de ${quantity} brief(s) extra(s) - Plan ${plan}`,
          },
          unit_amount: unitAmount,
        },
        quantity,
      }],
      success_url: 'http://localhost:3000/CheckoutSuccess',
      cancel_url: 'http://localhost:3000/CheckoutCancel',
      metadata: {
        userId,
        quantity: quantity.toString(),
        type: 'briefs',
      },
    });

    return res.json({ sessionId: session.id });
  } catch (err) {
    console.error('Error al crear sesión de checkout para briefs:', err);
    return res.status(500).json({ error: 'Error al crear la sesión de pago' });
  }
});

// Crear sesión de pago para comprar plan
router.post('/:userId/plan/checkout-session', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { plan } = req.body;

  if (!plan) {
    return res.status(400).json({ error: 'Plan inválido' });
  }

  try {
    const pricesByPlan = {
      básico: 1000,
      basic: 1000,
      premium: 8000,
      pro: 3000,
      equipo: 3000
    };

    const unitAmount = pricesByPlan[plan.toLowerCase()];
    if (!unitAmount) {
      return res.status(400).json({ error: 'Plan no soportado' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Plan ${plan}`,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      }],
      success_url: 'http://localhost:3000/CheckoutSuccess',
      cancel_url: 'http://localhost:3000/CheckoutCancel',
      metadata: {
        userId,
        plan,
        type: 'plan',
      },
    });

    return res.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error('Error al crear sesión de checkout para plan:', err);
    return res.status(500).json({ error: 'Error al crear la sesión de pago' });
  }
});

// Webhook Stripe para detectar pago exitoso
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object;
  const { userId, plan, quantity, type } = session.metadata;

  if (event.type === 'checkout.session.completed') {
    try {
      if (type === 'plan') {
        await updateUserPlanAfterPayment(userId, plan);
        console.log(`✅ Plan actualizado para usuario ${userId} a ${plan}`);
      } else if (type === 'briefs') {
        const qty = parseInt(quantity, 10) || 1;
        await updateUserBriefsAfterPayment(userId, qty);
        console.log(`✅ Briefs actualizados para usuario ${userId}: +${qty}`);
      }
      return res.json({ received: true });
    } catch (err) {
      console.error('❌ Error actualizando datos tras pago:', err);
      return res.status(500).send('Error al procesar el pago');
    }
  }

  res.json({ received: true });
});

module.exports = router;
