import { User, Inspection, Payment, Technician } from '../models/index.js';
import { Op } from 'sequelize';

export const getDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalClients = await User.count({ where: { role: 'cliente' } });
    const totalTechnicians = await User.count({ where: { role: 'tecnico' } });
    const totalInspections = await Inspection.count();
    const completedInspections = await Inspection.count({ where: { status: 'completada' } });
    const pendingInspections = await Inspection.count({ where: { status: 'pendiente' } });

    const totalPayments = await Payment.sum('amount', { where: { status: 'completado' } });
    const totalIncome = totalPayments || 0;

    const recentInspections = await Inspection.findAll({
      include: [
        { association: 'client', attributes: ['firstName', 'lastName'] },
        { association: 'technician', attributes: ['firstName', 'lastName'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    res.json({
      dashboard: {
        users: {
          total: totalUsers,
          clients: totalClients,
          technicians: totalTechnicians,
        },
        inspections: {
          total: totalInspections,
          completed: completedInspections,
          pending: pendingInspections,
          inProgress: totalInspections - completedInspections - pendingInspections,
        },
        revenue: {
          total: parseFloat(totalIncome.toFixed(2)),
        },
        recentInspections,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllTechnicians = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, isAvailable } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (isAvailable !== undefined) where.isAvailable = isAvailable === 'true';

    const { count, rows } = await Technician.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'city'],
        },
      ],
      limit,
      offset,
      order: [['averageRating', 'DESC']],
    });

    res.json({
      technicians: rows,
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

export const manageTechnician = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isAvailable, specialization, hourlyRate } = req.body;

    const technician = await Technician.findByPk(id);
    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    await technician.update({
      isAvailable: isAvailable !== undefined ? isAvailable : technician.isAvailable,
      specialization: specialization || technician.specialization,
      hourlyRate: hourlyRate || technician.hourlyRate,
    });

    res.json({
      message: 'Technician updated',
      technician,
    });
  } catch (err) {
    next(err);
  }
};

export const getInspectionReports = async (req, res, next) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await Inspection.findAndCountAll({
      where,
      include: [
        { association: 'client', attributes: ['firstName', 'lastName', 'email'] },
        { association: 'technician', attributes: ['firstName', 'lastName', 'email'] },
        { association: 'payment', attributes: ['amount', 'status'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const inspectionsByType = await Inspection.findAll({
      attributes: [
        'inspectionType',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['inspectionType'],
      raw: true,
    });

    res.json({
      inspections: rows,
      inspectionsByType,
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

export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = { status: 'completado' };
    if (startDate || endDate) {
      where.paidAt = {};
      if (startDate) where.paidAt[Op.gte] = new Date(startDate);
      if (endDate) where.paidAt[Op.lte] = new Date(endDate);
    }

    const payments = await Payment.findAll({ where });
    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const revenueByInspectionType = await Inspection.findAll({
      include: [
        {
          model: Payment,
          where: { status: 'completado' },
          required: true,
        },
      ],
      attributes: [
        'inspectionType',
        [require('sequelize').fn('COUNT', require('sequelize').col('Inspections.id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('Payment.amount')), 'total'],
      ],
      group: ['inspectionType'],
      raw: true,
    });

    const monthlyRevenue = await Payment.findAll({
      where,
      attributes: [
        [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('paidAt')), 'month'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'total'],
      ],
      group: [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('paidAt'))],
      order: [[require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('paidAt')), 'ASC']],
      raw: true,
    });

    res.json({
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      paymentCount: payments.length,
      averagePayment: payments.length > 0 ? parseFloat((totalRevenue / payments.length).toFixed(2)) : 0,
      revenueByInspectionType,
      monthlyRevenue,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserManagement = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      users: rows,
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

export const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ isActive: false });
    res.json({ message: 'User deactivated', user });
  } catch (err) {
    next(err);
  }
};

export const activateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ isActive: true });
    res.json({ message: 'User activated', user });
  } catch (err) {
    next(err);
  }
};

export const getSystemMetrics = async (req, res, next) => {
  try {
    const totalRegisteredUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const totalInspections = await Inspection.count();
    const thisMonthInspections = await Inspection.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          [Op.lte]: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        },
      },
    });

    const completionRate = totalInspections > 0 
      ? (await Inspection.count({ where: { status: 'completada' } }) / totalInspections * 100).toFixed(2)
      : 0;

    res.json({
      metrics: {
        totalUsers: totalRegisteredUsers,
        activeUsers,
        totalInspections,
        thisMonthInspections,
        completionRate: parseFloat(completionRate),
        systemHealth: 'operational',
      },
    });
  } catch (err) {
    next(err);
  }
};
