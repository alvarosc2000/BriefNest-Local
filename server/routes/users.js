const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();
const db = require('../db'); // Asegúrate de tener esto apuntando a tu conexión a PostgreSQL

const {
  createUser,
  loginUser,
  updateUserPlan,
  buyExtraBrief,
  getUserPlan,
  getUserById,
  updateUserPlanAfterPayment,
  updateUserBriefsAfterPayment,
  authenticateToken
} = require('../controllers/userController');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Rutas de usuario
router.post('/register', createUser);
router.post('/login', loginUser);
router.put('/:userId/plan', updateUserPlan);
router.put('/:userId/buy-brief', authenticateToken, buyExtraBrief);
router.get('/:userId/info-plan', getUserPlan);
router.get('/:userId', getUserById);

// Crear sesión de pago para comprar briefs extra
router.post('/:userId/briefs/checkout-session', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Cantidad inválida' });
  }

  try {
    // Obtener plan del usuario
    const result = await db.query(
      'SELECT subscription_plan FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const plan = result.rows[0].subscription_plan;

    // Definir precios por plan
    const pricesByPlan = {
      basic: 500,   // $5.00
      premium: 300, // $3.00
      pro: 100      // $1.00
    };

    const unitAmount = pricesByPlan[plan?.toLowerCase()] || 500;

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
      basic: 1000,
      premium: 2000,
      pro: 3000
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

    return res.json({ sessionId: session.id });
  } catch (err) {
    console.error('Error al crear sesión de checkout para plan:', err);
    return res.status(500).json({ error: 'Error al crear la sesión de pago' });
  }
});

// Webhook Stripe para detectar pago exitoso
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, plan, quantity, type } = session.metadata;

    if (type === 'plan') {
      updateUserPlanAfterPayment(userId, plan)
        .then(() => {
          console.log(`Plan actualizado para usuario ${userId} a ${plan} tras pago.`);
          res.json({ received: true });
        })
        .catch((err) => {
          console.error('Error actualizando plan después de pago:', err);
          res.status(500).send('Error actualizando plan');
        });
    } else if (type === 'briefs') {
      const qty = parseInt(quantity, 10) || 1;
      updateUserBriefsAfterPayment(userId, qty)
        .then(() => {
          console.log(`Briefs actualizados para usuario ${userId}, cantidad ${qty} tras pago.`);
          res.json({ received: true });
        })
        .catch((err) => {
          console.error('Error actualizando briefs después de pago:', err);
          res.status(500).send('Error actualizando briefs');
        });
    } else {
      res.json({ received: true });
    }
  } else {
    res.json({ received: true });
  }
});

module.exports = router;
