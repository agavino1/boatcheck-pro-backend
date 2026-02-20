import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  inspectionId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'Inspections',
      key: 'id',
    },
  },
  technicianId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  summary: {
    type: DataTypes.TEXT,
  },
  findings: {
    type: DataTypes.JSON,
  },
  recommendations: {
    type: DataTypes.TEXT,
  },
  issues: {
    type: DataTypes.JSON,
  },
  photos: {
    type: DataTypes.JSON,
  },
  overallCondition: {
    type: DataTypes.ENUM('excelente', 'bueno', 'aceptable', 'deficiente', 'critico'),
  },
  reportUrl: {
    type: DataTypes.STRING,
  },
  pdfUrl: {
    type: DataTypes.STRING,
  },
  generatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
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

export default Report;
