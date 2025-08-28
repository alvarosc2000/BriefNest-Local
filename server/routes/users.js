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
  updateUserBriefsAfterPayment,
  resetPassword 
} = require('../controllers/userController');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Rutas de usuario
router.post('/register', createUser);
router.post('/login', loginUser);
router.put('/:userId/plan', updateUserPlan);
router.put('/:userId/buy-brief', authenticateToken, buyExtraBrief);
router.get('/:userId/info-plan', getUserPlanWithExpirationCheck);
router.get('/:userId', getUserById);
router.post('/:reset-password', resetPassword );

// Crear sesión de pago para comprar briefs extra (Stripe)
router.post('/:userId/briefs/checkout-session', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Cantidad inválida' });
  }

  try {
    const result = await db.query(
      'SELECT subscription_plan, isexpired FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    if (!user.subscription_plan || user.isexpired) {
      return res.status(403).json({ error: 'No puedes comprar briefs si tu plan no está activo' });
    }

    const pricesByPlan = {
      básico: 700,  // $7.00
      basic: 700,
      pro: 500,     // $5.00
      premium: 300, // $3.00
      equipo: 300
    };

    const unitAmount = pricesByPlan[user.subscription_plan.toLowerCase()] || 700;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Compra de ${quantity} brief(s) extra(s) - Plan ${user.subscription_plan}`,
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

    // Devuelve la URL directamente para que el frontend redirija
    return res.json({ checkoutUrl: session.url });

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

// Simular compra de plan sin Stripe
router.post('/:userId/simulate-buy-plan', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { plan } = req.body;

  if (!plan) return res.status(400).json({ error: 'Plan inválido' });

  try {
    // Lógica de precios y briefs según plan
    let briefs_available = 0, price_per_extra_brief = 0, planName = '';

    if (plan.toLowerCase() === 'basic' || plan.toLowerCase() === 'básico') {
      briefs_available = 3; price_per_extra_brief = 7; planName = 'Básico';
    } else if (plan.toLowerCase() === 'pro') {
      briefs_available = 10; price_per_extra_brief = 5; planName = 'Pro';
    } else if (plan.toLowerCase() === 'premium' || plan.toLowerCase() === 'equipo') {
      briefs_available = 30; price_per_extra_brief = 3; planName = 'Equipo';
    } else {
      return res.status(400).json({ error: 'Plan no válido' });
    }

    // Fecha de renovación = 1 mes desde hoy
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    const result = await db.query(
      `UPDATE users
       SET subscription_plan = $1,
           briefs_available = $2,
           briefs_used = 0,
           price_per_extra_brief = $3,
           subscription_renewal = $4,
           isexpired = false
       WHERE id = $5
       RETURNING *`,
      [planName, briefs_available, price_per_extra_brief, renewalDate, userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ message: `Plan ${planName} comprado con éxito`, user: result.rows[0] });

  } catch (err) {
    console.error('Error al simular compra de plan:', err);
    res.status(500).json({ error: 'Error al actualizar plan' });
  }
});

// Simular compra de briefs sin Stripe
router.post('/:userId/simulate-buy-briefs', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) return res.status(400).json({ error: 'Cantidad inválida' });

  try {
    const userResult = await db.query('SELECT subscription_plan, isexpired FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    const user = userResult.rows[0];

    if (!user.subscription_plan || user.isexpired) {
      return res.status(403).json({ error: 'No puedes comprar briefs si tu plan no está activo' });
    }

    const updateResult = await db.query(
      `UPDATE users
       SET briefs_available = briefs_available + $1
       WHERE id = $2
       RETURNING briefs_available, briefs_used`,
      [quantity, userId]
    );

    res.json({
      message: `Se compraron ${quantity} briefs extra`,
      user: updateResult.rows[0],
    });

  } catch (err) {
    console.error('Error al simular compra de briefs:', err);
    res.status(500).json({ error: 'Error al actualizar briefs' });
  }
});


module.exports = router;
