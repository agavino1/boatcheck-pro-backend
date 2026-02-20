import sequelize from '../src/config/database.js';
import { User, Inspection, Payment, Technician, Report } from '../src/models/index.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Sync database
    await sequelize.sync({ force: true });
    console.log('✓ Database models synchronized (reset)');

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@boatcheck.pro',
      password: 'AdminPassword123!',
      role: 'admin',
      emailVerified: true,
      city: 'Miami',
      country: 'USA',
    });
    console.log('✓ Admin user created');

    // Create sample clients
    const clients = await Promise.all([
      User.create({
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        password: 'Password123!',
        role: 'cliente',
        emailVerified: true,
        phone: '305-555-0101',
        address: '123 Marina Drive',
        city: 'Miami',
        state: 'FL',
        zipCode: '33139',
        country: 'USA',
        companyName: 'Smith Marine Services',
      }),
      User.create({
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@example.com',
        password: 'Password123!',
        role: 'cliente',
        emailVerified: true,
        phone: '305-555-0102',
        address: '456 Ocean Boulevard',
        city: 'Fort Lauderdale',
        state: 'FL',
        zipCode: '33316',
        country: 'USA',
      }),
      User.create({
        firstName: 'Robert',
        lastName: 'Martinez',
        email: 'r.martinez@example.com',
        password: 'Password123!',
        role: 'cliente',
        emailVerified: true,
        phone: '305-555-0103',
        city: 'Key Biscayne',
        state: 'FL',
        country: 'USA',
      }),
    ]);
    console.log('✓ 3 client users created');

    // Create sample technicians
    const technicians = await Promise.all([
      User.create({
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@boatcheck.pro',
        password: 'Password123!',
        role: 'tecnico',
        emailVerified: true,
        phone: '305-555-0201',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
      }),
      User.create({
        firstName: 'David',
        lastName: 'Garcia',
        email: 'david.garcia@boatcheck.pro',
        password: 'Password123!',
        role: 'tecnico',
        emailVerified: true,
        phone: '305-555-0202',
        city: 'Miami Beach',
        state: 'FL',
        country: 'USA',
      }),
      User.create({
        firstName: 'Lisa',
        lastName: 'Anderson',
        email: 'lisa.anderson@boatcheck.pro',
        password: 'Password123!',
        role: 'tecnico',
        emailVerified: true,
        phone: '305-555-0203',
        city: 'Coral Gables',
        state: 'FL',
        country: 'USA',
      }),
    ]);
    console.log('✓ 3 technician users created');

    // Create technician profiles
    await Promise.all([
      Technician.create({
        userId: technicians[0].id,
        licenseNumber: 'LIC-2024-001',
        licenseExpiry: new Date('2026-12-31'),
        specialization: 'Motor Boats',
        yearsOfExperience: 8,
        certifications: ['ABYC', 'Marine Survey'],
        bio: 'Expert in motor boat inspections with over 8 years of experience',
        hourlyRate: 150,
        averageRating: 4.8,
        totalInspections: 125,
        totalReviews: 42,
        isAvailable: true,
      }),
      Technician.create({
        userId: technicians[1].id,
        licenseNumber: 'LIC-2024-002',
        licenseExpiry: new Date('2025-12-31'),
        specialization: 'Sailing Yachts',
        yearsOfExperience: 12,
        certifications: ['ABYC', 'Marine Survey', 'Rigging'],
        bio: 'Specialist in sailing yacht inspections and rigging evaluation',
        hourlyRate: 175,
        averageRating: 4.9,
        totalInspections: 189,
        totalReviews: 67,
        isAvailable: true,
      }),
      Technician.create({
        userId: technicians[2].id,
        licenseNumber: 'LIC-2024-003',
        licenseExpiry: new Date('2027-06-30'),
        specialization: 'Sailboats',
        yearsOfExperience: 6,
        certifications: ['ABYC', 'Marine Survey'],
        bio: 'Thorough and professional sailboat inspection services',
        hourlyRate: 130,
        averageRating: 4.7,
        totalInspections: 94,
        totalReviews: 38,
        isAvailable: true,
      }),
    ]);
    console.log('✓ 3 technician profiles created');

    // Create sample inspections
    const inspections = await Promise.all([
      Inspection.create({
        clientId: clients[0].id,
        technicianId: technicians[0].id,
        boatName: 'Seabreeze',
        boatModel: 'Grady-White 25',
        boatYear: 2018,
        boatLength: 25,
        inspectionType: 'pre-compra',
        status: 'completada',
        description: 'Pre-purchase inspection for sale verification',
        location: 'Miami Marina',
        scheduledDate: new Date('2024-02-15'),
        completedDate: new Date('2024-02-15'),
        price: 450,
        rating: 5,
        comment: 'Excellent service, very thorough inspection!',
      }),
      Inspection.create({
        clientId: clients[1].id,
        technicianId: technicians[1].id,
        boatName: 'Wind Dancer',
        boatModel: 'Beneteau 40',
        boatYear: 2015,
        boatLength: 40,
        inspectionType: 'anual',
        status: 'completada',
        description: 'Annual safety and maintenance inspection',
        location: 'Fort Lauderdale Port',
        scheduledDate: new Date('2024-02-10'),
        completedDate: new Date('2024-02-10'),
        price: 600,
        rating: 4.5,
        comment: 'Good service, found some maintenance issues to address',
      }),
      Inspection.create({
        clientId: clients[2].id,
        boatName: 'Ocean Quest',
        boatModel: 'Catalina 30',
        boatYear: 2020,
        boatLength: 30,
        inspectionType: 'mantenimiento',
        status: 'confirmada',
        description: 'Regular maintenance inspection',
        location: 'Key Biscayne Dock',
        scheduledDate: new Date('2024-03-01'),
        price: 350,
      }),
      Inspection.create({
        clientId: clients[0].id,
        boatName: 'Island Hopper',
        boatModel: 'Boston Whaler 33',
        boatYear: 2016,
        boatLength: 33,
        inspectionType: 'seguridad',
        status: 'pendiente',
        description: 'Safety and compliance inspection',
        location: 'Miami Marina',
        scheduledDate: new Date('2024-03-15'),
        price: 500,
      }),
    ]);
    console.log('✓ 4 inspections created');

    // Create sample payments
    const payments = await Promise.all([
      Payment.create({
        inspectionId: inspections[0].id,
        userId: clients[0].id,
        amount: 450,
        currency: 'USD',
        stripePaymentIntentId: 'pi_test_001',
        status: 'completado',
        paymentMethod: 'card',
        invoiceNumber: 'INV-2024-001',
        paidAt: new Date('2024-02-15'),
      }),
      Payment.create({
        inspectionId: inspections[1].id,
        userId: clients[1].id,
        amount: 600,
        currency: 'USD',
        stripePaymentIntentId: 'pi_test_002',
        status: 'completado',
        paymentMethod: 'card',
        invoiceNumber: 'INV-2024-002',
        paidAt: new Date('2024-02-10'),
      }),
      Payment.create({
        inspectionId: inspections[2].id,
        userId: clients[2].id,
        amount: 350,
        currency: 'USD',
        stripePaymentIntentId: 'pi_test_003',
        status: 'completado',
        paymentMethod: 'card',
        invoiceNumber: 'INV-2024-003',
        paidAt: new Date('2024-02-20'),
      }),
    ]);
    console.log('✓ 3 payments created');

    // Create sample reports
    await Promise.all([
      Report.create({
        inspectionId: inspections[0].id,
        technicianId: technicians[0].id,
        clientId: clients[0].id,
        title: 'Pre-Purchase Inspection Report - Seabreeze',
        summary: 'Overall excellent condition for a 2018 model. No major issues found.',
        overallCondition: 'excelente',
        findings: {
          hull: 'Minor cosmetic scratches, structurally sound',
          engine: 'Well maintained, recent service records available',
          electrical: 'All systems functional',
          interior: 'Clean and well-maintained',
        },
        recommendations: 'Schedule routine maintenance as recommended in owner manual',
        pdfUrl: 'https://api.example.com/reports/report-001.pdf',
      }),
      Report.create({
        inspectionId: inspections[1].id,
        technicianId: technicians[1].id,
        clientId: clients[1].id,
        title: 'Annual Inspection Report - Wind Dancer',
        summary: 'Good overall condition with some maintenance items to address.',
        overallCondition: 'bueno',
        findings: {
          hull: 'Sound condition, no cracks',
          rigging: 'Some lines need replacement',
          sails: 'Good condition, minor wear',
          engine: 'Needs oil change',
        },
        recommendations: 'Replace rigging lines before summer season, service engine',
        pdfUrl: 'https://api.example.com/reports/report-002.pdf',
      }),
    ]);
    console.log('✓ 2 reports created');

    console.log('\n✓ Database seed completed successfully!');
    console.log('\nTest credentials:');
    console.log('Admin: admin@boatcheck.pro / AdminPassword123!');
    console.log('Client: john.smith@example.com / Password123!');
    console.log('Technician: michael.brown@boatcheck.pro / Password123!');

    await sequelize.close();
  } catch (err) {
    console.error('✗ Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
