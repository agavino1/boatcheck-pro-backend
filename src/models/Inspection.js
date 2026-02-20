import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Inspection = sequelize.define('Inspection', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  technicianId: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  boatName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  boatModel: {
    type: DataTypes.STRING,
  },
  boatLength: {
    type: DataTypes.DECIMAL(10, 2),
  },
  boatYear: {
    type: DataTypes.INTEGER,
  },
  inspectionType: {
    type: DataTypes.ENUM('pre-compra', 'mantenimiento', 'seguridad', 'anual', 'otro'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'en-progreso', 'completada', 'cancelada'),
    defaultValue: 'pendiente',
  },
  description: {
    type: DataTypes.TEXT,
  },
  location: {
    type: DataTypes.STRING,
  },
  scheduledDate: {
    type: DataTypes.DATE,
  },
  completedDate: {
    type: DataTypes.DATE,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  reportUrl: {
    type: DataTypes.STRING,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
  },
  comment: {
    type: DataTypes.TEXT,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default Inspection;
