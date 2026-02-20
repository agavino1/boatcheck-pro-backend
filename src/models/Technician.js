import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Technician = sequelize.define('Technician', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  licenseNumber: {
    type: DataTypes.STRING,
    unique: true,
  },
  licenseExpiry: {
    type: DataTypes.DATE,
  },
  specialization: {
    type: DataTypes.STRING,
  },
  yearsOfExperience: {
    type: DataTypes.INTEGER,
  },
  certifications: {
    type: DataTypes.JSON,
  },
  bio: {
    type: DataTypes.TEXT,
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
  },
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
  },
  totalInspections: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  serviceArea: {
    type: DataTypes.JSON,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  weeklySchedule: {
    type: DataTypes.JSON,
  },
  documents: {
    type: DataTypes.JSON,
  },
  bankAccount: {
    type: DataTypes.JSON,
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

export default Technician;
