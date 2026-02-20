import { Inspection, User, Payment, Technician, Report } from '../models/index.js';
import { Op } from 'sequelize';

export const createInspection = async (req, res, next) => {
  try {
    const { boatName, boatModel, boatYear, inspectionType, description, location, scheduledDate, price } = req.body;

    if (!boatName || !inspectionType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const inspection = await Inspection.create({
      clientId: req.user.id,
      boatName,
      boatModel,
      boatYear,
      inspectionType,
      description,
      location,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      price: price || 0,
      status: 'pendiente',
    });

    res.status(201).json({
      message: 'Inspection created successfully',
      inspection,
    });
  } catch (err) {
    next(err);
  }
};

export const getInspections = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, inspectionType, technicianId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (inspectionType) where.inspectionType = inspectionType;
    if (technicianId) where.technicianId = technicianId;

    const { count, rows } = await Inspection.findAndCountAll({
      where,
      include: [
        { association: 'client', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
        { association: 'technician', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { association: 'payment', attributes: ['status', 'amount', 'paidAt'] },
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

export const getInspectionById = async (req, res, next) => {
  try {
    const inspection = await Inspection.findByPk(req.params.id, {
      include: [
        { association: 'client', attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'address'] },
        { association: 'technician', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
        { association: 'payment', attributes: ['status', 'amount', 'paidAt', 'invoiceUrl'] },
        { association: 'report' },
      ],
    });

    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    res.json({ inspection });
  } catch (err) {
    next(err);
  }
};

export const updateInspection = async (req, res, next) => {
  try {
    const inspection = await Inspection.findByPk(req.params.id);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    const { boatName, boatModel, boatYear, inspectionType, description, location, scheduledDate, status, technicianId } = req.body;

    await inspection.update({
      boatName: boatName || inspection.boatName,
      boatModel: boatModel || inspection.boatModel,
      boatYear: boatYear || inspection.boatYear,
      inspectionType: inspectionType || inspection.inspectionType,
      description: description || inspection.description,
      location: location || inspection.location,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : inspection.scheduledDate,
      status: status || inspection.status,
      technicianId: technicianId || inspection.technicianId,
    });

    res.json({
      message: 'Inspection updated successfully',
      inspection: await inspection.reload(),
    });
  } catch (err) {
    next(err);
  }
};

export const assignTechnician = async (req, res, next) => {
  try {
    const { technicianId } = req.body;

    const inspection = await Inspection.findByPk(req.params.id);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    const technician = await User.findByPk(technicianId);
    if (!technician || technician.role !== 'tecnico') {
      return res.status(400).json({ error: 'Invalid technician' });
    }

    await inspection.update({
      technicianId,
      status: 'confirmada',
    });

    res.json({
      message: 'Technician assigned successfully',
      inspection,
    });
  } catch (err) {
    next(err);
  }
};

export const completeInspection = async (req, res, next) => {
  try {
    const inspection = await Inspection.findByPk(req.params.id);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    await inspection.update({
      status: 'completada',
      completedDate: new Date(),
    });

    res.json({
      message: 'Inspection completed',
      inspection,
    });
  } catch (err) {
    next(err);
  }
};

export const cancelInspection = async (req, res, next) => {
  try {
    const inspection = await Inspection.findByPk(req.params.id);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    await inspection.update({ status: 'cancelada' });

    res.json({
      message: 'Inspection cancelled',
      inspection,
    });
  } catch (err) {
    next(err);
  }
};

export const rateInspection = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const inspection = await Inspection.findByPk(req.params.id);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    if (inspection.clientId !== req.user.id) {
      return res.status(403).json({ error: 'Only the client can rate this inspection' });
    }

    await inspection.update({ rating, comment });

    // Update technician's average rating
    if (inspection.technicianId) {
      const inspections = await Inspection.findAll({
        where: { technicianId: inspection.technicianId, rating: { [Op.not]: null } },
      });

      const avgRating = inspections.reduce((sum, insp) => sum + insp.rating, 0) / inspections.length;
      await Technician.update(
        { averageRating: parseFloat(avgRating.toFixed(2)) },
        { where: { userId: inspection.technicianId } }
      );
    }

    res.json({
      message: 'Inspection rated successfully',
      inspection,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteInspection = async (req, res, next) => {
  try {
    const inspection = await Inspection.findByPk(req.params.id);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Only allow deletion if not yet completed
    if (inspection.status === 'completada') {
      return res.status(400).json({ error: 'Cannot delete completed inspections' });
    }

    await inspection.destroy();
    res.json({ message: 'Inspection deleted successfully' });
  } catch (err) {
    next(err);
  }
};
