import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  inspectionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Inspections',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD',
  },
  stripePaymentIntentId: {
    type: DataTypes.STRING,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'procesando', 'completado', 'fallido', 'reembolsado'),
    defaultValue: 'pendiente',
  },
  paymentMethod: {
    type: DataTypes.STRING,
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    unique: true,
  },
  invoiceUrl: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  metadata: {
    type: DataTypes.JSON,
  },
  paidAt: {
    type: DataTypes.DATE,
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

export default Payment;
