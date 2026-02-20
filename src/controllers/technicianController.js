import { Technician, User, Inspection } from '../models/index.js';
import { Op } from 'sequelize';

export const createTechnicianProfile = async (req, res, next) => {
  try {
    const { licenseNumber, specialization, yearsOfExperience, certifications, bio, hourlyRate, weeklySchedule, serviceArea } = req.body;

    const user = await User.findByPk(req.user.id);
    if (user.role !== 'tecnico') {
      return res.status(400).json({ error: 'User must have technician role' });
    }

    const existingTech = await Technician.findOne({ where: { userId: req.user.id } });
    if (existingTech) {
      return res.status(400).json({ error: 'Technician profile already exists' });
    }

    const technician = await Technician.create({
      userId: req.user.id,
      licenseNumber,
      specialization,
      yearsOfExperience,
      certifications: certifications || [],
      bio,
      hourlyRate,
      weeklySchedule: weeklySchedule || {},
      serviceArea: serviceArea || [],
    });

    res.status(201).json({
      message: 'Technician profile created',
      technician,
    });
  } catch (err) {
    next(err);
  }
};

export const getTechnicians = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, specialization, minRating, search, city } = req.query;
    const offset = (page - 1) * limit;

    const where = { isAvailable: true };
    if (specialization) where.specialization = specialization;
    if (minRating) where.averageRating = { [Op.gte]: parseFloat(minRating) };

    const include = [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'city', 'profileImageUrl'],
        where: search
          ? { [Op.or]: [{ firstName: { [Op.iLike]: `%${search}%` } }, { lastName: { [Op.iLike]: `%${search}%` } }] }
          : {},
      },
    ];

    const { count, rows } = await Technician.findAndCountAll({
      where,
      include,
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

export const getTechnicianProfile = async (req, res, next) => {
  try {
    const technician = await Technician.findOne({
      where: { userId: req.params.id },
      include: [
        {
          model: User,
          attributes: { exclude: ['password'] },
        },
      ],
    });

    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    res.json({ technician });
  } catch (err) {
    next(err);
  }
};

export const updateTechnicianProfile = async (req, res, next) => {
  try {
    const technician = await Technician.findOne({ where: { userId: req.user.id } });
    if (!technician) {
      return res.status(404).json({ error: 'Technician profile not found' });
    }

    const { licenseNumber, specialization, yearsOfExperience, certifications, bio, hourlyRate, weeklySchedule, serviceArea, isAvailable } = req.body;

    await technician.update({
      licenseNumber: licenseNumber || technician.licenseNumber,
      specialization: specialization || technician.specialization,
      yearsOfExperience: yearsOfExperience || technician.yearsOfExperience,
      certifications: certifications || technician.certifications,
      bio: bio || technician.bio,
      hourlyRate: hourlyRate || technician.hourlyRate,
      weeklySchedule: weeklySchedule || technician.weeklySchedule,
      serviceArea: serviceArea || technician.serviceArea,
      isAvailable: isAvailable !== undefined ? isAvailable : technician.isAvailable,
    });

    res.json({
      message: 'Technician profile updated',
      technician,
    });
  } catch (err) {
    next(err);
  }
};

export const getTechnicianInspections = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { technicianId: req.user.id };
    if (status) where.status = status;

    const { count, rows } = await Inspection.findAndCountAll({
      where,
      include: [
        { association: 'client', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
        { association: 'payment', attributes: ['status', 'amount'] },
      ],
      order: [['scheduledDate', 'ASC']],
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

export const getTechnicianStats = async (req, res, next) => {
  try {
    const technician = await Technician.findOne({ where: { userId: req.user.id } });
    if (!technician) {
      return res.status(404).json({ error: 'Technician profile not found' });
    }

    const totalInspections = await Inspection.count({
      where: { technicianId: req.user.id },
    });

    const completedInspections = await Inspection.count({
      where: { technicianId: req.user.id, status: 'completada' },
    });

    const upcomingInspections = await Inspection.count({
      where: {
        technicianId: req.user.id,
        status: ['confirmada', 'en-progreso'],
        scheduledDate: { [Op.gte]: new Date() },
      },
    });

    const inspectionsByType = await Inspection.findAll({
      where: { technicianId: req.user.id },
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
        upcomingInspections,
        pendingInspections: totalInspections - completedInspections - upcomingInspections,
        averageRating: technician.averageRating,
        inspectionsByType,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateTechnicianAvailability = async (req, res, next) => {
  try {
    const { isAvailable, weeklySchedule } = req.body;

    const technician = await Technician.findOne({ where: { userId: req.user.id } });
    if (!technician) {
      return res.status(404).json({ error: 'Technician profile not found' });
    }

    await technician.update({
      isAvailable: isAvailable !== undefined ? isAvailable : technician.isAvailable,
      weeklySchedule: weeklySchedule || technician.weeklySchedule,
    });

    res.json({
      message: 'Availability updated',
      technician,
    });
  } catch (err) {
    next(err);
  }
};

export const getTechnicianCalendar = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const date = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()) + 1, 0);

    const inspections = await Inspection.findAll({
      where: {
        technicianId: req.user.id,
        scheduledDate: {
          [Op.between]: [
            new Date(date.getFullYear(), date.getMonth(), 1),
            new Date(date.getFullYear(), date.getMonth() + 1, 0),
          ],
        },
      },
      attributes: ['id', 'boatName', 'scheduledDate', 'status'],
      order: [['scheduledDate', 'ASC']],
    });

    res.json({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      inspections,
    });
  } catch (err) {
    next(err);
  }
};
