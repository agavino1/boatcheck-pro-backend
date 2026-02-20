import User from './User.js';
import Inspection from './Inspection.js';
import Payment from './Payment.js';
import Technician from './Technician.js';
import Report from './Report.js';

// Define associations
User.hasMany(Inspection, { foreignKey: 'clientId', as: 'inspections' });
Inspection.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

User.hasMany(Inspection, { foreignKey: 'technicianId', as: 'assignedInspections' });
Inspection.belongsTo(User, { foreignKey: 'technicianId', as: 'technician' });

User.hasOne(Technician, { foreignKey: 'userId', as: 'technicianProfile' });
Technician.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Inspection.hasOne(Payment, { foreignKey: 'inspectionId', as: 'payment' });
Payment.belongsTo(Inspection, { foreignKey: 'inspectionId' });

User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId' });

Inspection.hasOne(Report, { foreignKey: 'inspectionId', as: 'report' });
Report.belongsTo(Inspection, { foreignKey: 'inspectionId' });

User.hasMany(Report, { foreignKey: 'technicianId', as: 'techniciansReports' });
Report.belongsTo(User, { foreignKey: 'technicianId', as: 'technician' });

User.hasMany(Report, { foreignKey: 'clientId', as: 'clientReports' });
Report.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

export { User, Inspection, Payment, Technician, Report };
