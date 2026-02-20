import { User, Inspection, Technician } from '../models/index.js';
import { Op } from 'sequelize';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'emailVerificationToken'] },
      include: [
        { association: 'technicianProfile', attributes: ['licenseNumber', 'specialization', 'averageRating', 'totalInspections'] },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address, city, state, zipCode, country, companyName, profileImageUrl } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone || user.phone,
      address: address || user.address,
      city: city || user.city,
      state: state || user.state,
      zipCode: zipCode || user.zipCode,
      country: country || user.country,
      companyName: companyName || user.companyName,
      profileImageUrl: profileImageUrl || user.profileImageUrl,
    });

    res.json({
      message: 'Profile updated successfully',
      user: await user.reload({ attributes: { exclude: ['password'] } }),
    });
  } catch (err) {
    next(err);
  }
};

export const getMyInspections = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { clientId: req.user.id };
    if (status) where.status = status;

    const { count, rows } = await Inspection.findAndCountAll({
      where,
      include: [
        { association: 'technician', attributes: ['id', 'firstName', 'lastName'] },
        { association: 'payment', attributes: ['status', 'amount'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      inspections: rows,
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

export const getAllUsers = async (req, res, next) => {
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
      attributes: { exclude: ['password', 'emailVerificationToken'] },
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

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        { association: 'technicianProfile' },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { firstName, lastName, role, isActive, phone, address, city, state, zipCode, country } = req.body;

    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      role: role || user.role,
      isActive: isActive !== undefined ? isActive : user.isActive,
      phone: phone || user.phone,
      address: address || user.address,
      city: city || user.city,
      state: state || user.state,
      zipCode: zipCode || user.zipCode,
      country: country || user.country,
    });

    res.json({
      message: 'User updated successfully',
      user: await user.reload({ attributes: { exclude: ['password'] } }),
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const getStatistics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (user.role === 'cliente') {
      const totalInspections = await Inspection.count({ where: { clientId: userId } });
      const completedInspections = await Inspection.count({
        where: { clientId: userId, status: 'completada' },
      });

      const inspectionsByType = await Inspection.findAll({
        where: { clientId: userId },
        attributes: [
          'inspectionType',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        ],
        group: ['inspectionType'],
        raw: true,
      });

      res.json({
        statistics: {
          totalInspections,
          completedInspections,
          pendingInspections: totalInspections - completedInspections,
          inspectionsByType,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};
