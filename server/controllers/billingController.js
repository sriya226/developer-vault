const crypto = require('crypto');
const axios = require('axios');
const Bookmark = require('../models/Bookmark');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const { str } = require('../utils/constants');
const { PLANS, DAY_MS, PLAN_DURATION_DAYS, effectivePlanId, limitsFor } = require('../utils/plans');

// Reads Razorpay keys. Only test-mode keys (rzp_test_...) work unless live mode is explicitly allowed.
const getKeys = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw httpError(503, 'Payments are not configured yet.');
  if (!keyId.startsWith('rzp_test_') && process.env.RAZORPAY_ALLOW_LIVE !== 'true') {
    throw httpError(503, 'Only Razorpay test-mode keys are enabled (key must start with rzp_test_).');
  }
  return { keyId, keySecret };
};

// GET /api/billing/status
exports.status = asyncHandler(async (req, res) => {
  const [resources, payments] = await Promise.all([
    Bookmark.countDocuments({ userId: req.user._id }),
    Payment.find({ userId: req.user._id, status: 'paid' }).sort({ paidAt: -1 }).limit(10),
  ]);
  res.json({
    success: true,
    data: {
      plan: effectivePlanId(req.user),
      planExpiresAt: req.user.planExpiresAt,
      limits: limitsFor(req.user),
      usage: { resources, customCategories: req.user.customCategories.length },
      paymentsEnabled: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      payments: payments.map((p) => ({ id: p._id.toString(), plan: p.plan, amount: p.amount, currency: p.currency, paidAt: p.paidAt, paymentId: p.paymentId })),
    },
  });
});

// POST /api/billing/order  { plan: "pro" | "team" }  -> creates a Razorpay order
exports.createOrder = asyncHandler(async (req, res) => {
  const planId = str(req.body.plan);
  if (!['pro', 'team'].includes(planId)) throw httpError(400, 'Please choose a valid plan.');
  const { keyId, keySecret } = getKeys();
  const plan = PLANS[planId]; // price always comes from the server, never from the client

  let order;
  try {
    const { data } = await axios.post(
      'https://api.razorpay.com/v1/orders',
      { amount: plan.price, currency: 'INR', receipt: `vault_${Date.now()}`, notes: { userId: String(req.user._id), plan: planId } },
      { auth: { username: keyId, password: keySecret }, timeout: 15000 }
    );
    order = data;
  } catch (err) {
    console.error('Razorpay order error:', err.response?.data || err.message);
    throw httpError(502, 'Could not start the payment. Please try again.');
  }

  await Payment.create({ userId: req.user._id, orderId: order.id, plan: planId, amount: plan.price, currency: 'INR' });
  res.status(201).json({ success: true, data: { orderId: order.id, amount: order.amount, currency: order.currency, keyId, plan: planId } });
});

// POST /api/billing/verify  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
exports.verify = asyncHandler(async (req, res) => {
  const orderId = str(req.body.razorpay_order_id);
  const paymentId = str(req.body.razorpay_payment_id);
  const signature = str(req.body.razorpay_signature);
  if (!orderId || !paymentId || !signature) throw httpError(400, 'Missing payment details.');
  const { keySecret } = getKeys();

  // Razorpay signs "order_id|payment_id" with the key secret.
  const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw httpError(400, 'Payment verification failed.');

  // Claim the order exactly once (prevents replaying the same payment).
  const payment = await Payment.findOneAndUpdate(
    { orderId, userId: req.user._id, status: 'created' },
    { status: 'paid', paymentId, paidAt: new Date() },
    { new: true }
  );
  if (!payment) throw httpError(409, 'This payment was already processed or does not belong to your account.');

  const now = new Date();
  const renewing = effectivePlanId(req.user) === payment.plan && req.user.planExpiresAt > now;
  const base = renewing ? req.user.planExpiresAt : now; // renewing extends; switching plans starts from today
  req.user.plan = payment.plan;
  req.user.planExpiresAt = new Date(base.getTime() + PLAN_DURATION_DAYS * DAY_MS);
  await req.user.save();

  res.json({ success: true, data: { user: req.user } });
});
