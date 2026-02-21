import Stripe from 'stripe';
import { Payment, Inspection, User } from '../models/index.js';
import { generateInvoice } from '../utils/invoice.js';
import { Op } from 'sequelize';

let stripe = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
} catch (e) {
  stripe = null;
  console.error('Stripe init failed:', e.message);
}

const ensureStripe = (res) => {
  if (!stripe) {
    res.status(503).json({ error: 'Stripe is not configured' });
    return false;
  }
  return true;
};

export const createPaymentIntent = async (req, res, next) => {
  try {
    if (!ensureStripe(res)) return;

    const { inspectionId, amount } = req.body;

    if (!inspectionId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const inspection = await Inspection.findByPk(inspectionId);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    if (inspection.clientId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: {
        inspectionId,
        userId: req.user.id,
      },
    });

    // Create payment record in DB
    const payment = await Payment.create({
      inspectionId,
      userId: req.user.id,
      amount,
      currency: 'USD',
      stripePaymentIntentId: paymentIntent.id,
      status: 'procesando',
    });

    res.json({
      message: 'Payment intent created',
      clientSecret: paymentIntent.client_secret,
      payment,
    });
  } catch (err) {
    next(err);
  }
};

export const confirmPayment = async (req, res, next) => {
  try {
    if (!ensureStripe(res)) return;

    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful' });
    }

    const payment = await Payment.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    await payment.update({
      status: 'completado',
      paidAt: new Date(),
      invoiceNumber,
    });

    // Generate and store invoice
    const invoiceUrl = await generateInvoice(payment, invoiceNumber);
    await payment.update({ invoiceUrl });

    // Update inspection status
    const inspection = await Inspection.findByPk(payment.inspectionId);
    if (inspection.status === 'pendiente') {
      await inspection.update({ status: 'confirmada' });
    }

    res.json({
      message: 'Payment confirmed successfully',
      payment,
      invoiceUrl,
    });
  } catch (err) {
    next(err);
  }
};

export const getPaymentHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (status) where.status = status;

    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: Inspection,
          attributes: ['id', 'boatName', 'boatModel', 'inspectionType'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      payments: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [
        {
          model: Inspection,
          attributes: ['id', 'boatName', 'inspectionType', 'status'],
        },
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({ payment });
  } catch (err) {
    next(err);
  }
};

export const refundPayment = async (req, res, next) => {
  try {
    if (!ensureStripe(res)) return;

    const payment = await Payment.findByPk(req.params.id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'completado') {
      return res.status(400).json({ error: 'Only completed payments can be refunded' });
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
    });

    await payment.update({ status: 'reembolsado' });

    res.json({
      message: 'Refund processed successfully',
      refundId: refund.id,
      payment,
    });
  } catch (err) {
    next(err);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    if (!ensureStripe(res)) return;

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const payment = await Payment.findOne({
          where: { stripePaymentIntentId: paymentIntent.id },
        });

        if (payment) {
          await payment.update({
            status: 'completado',
            paidAt: new Date(),
          });
        }
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        const failedPayment = await Payment.findOne({
          where: { stripePaymentIntentId: failedIntent.id },
        });

        if (failedPayment) {
          await failedPayment.update({ status: 'fallido' });
        }
        break;
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};

export const getRevenueStats = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { startDate, endDate } = req.query;
    const where = { status: 'completado' };

    if (startDate || endDate) {
      where.paidAt = {};
      if (startDate) where.paidAt[Op.gte] = new Date(startDate);
      if (endDate) where.paidAt[Op.lte] = new Date(endDate);
    }

    const completedPayments = await Payment.findAll({ where });
    const totalRevenue = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const paymentsByType = await Payment.findAll({
      where,
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'total'],
      ],
      group: ['status'],
      raw: true,
    });

    res.json({
      totalRevenue,
      paymentCount: completedPayments.length,
      averagePayment: completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0,
      paymentsByStatus: paymentsByType,
    });
  } catch (err) {
    next(err);
  }
};
