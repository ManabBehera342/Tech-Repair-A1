const { Project, Device } = require('../models');

/**
 * Sample Data Seeding Utilities
 */

const seedSampleData = async () => {
  try {
    // Check if sample data already exists
    const existingProject = await Project.findOne({ integratorId: 'test@integrator.com' });
    if (existingProject) {
      console.log('📊 Sample data already exists, skipping seed.');
      return;
    }

    console.log('🌱 Seeding sample data for system integrator...');

    // Create sample projects
    const sampleProjects = [
      {
        projectId: 'PROJ-TEST-001',
        integratorId: 'test@integrator.com',
        name: 'Smart City Infrastructure',
        location: 'Downtown Metro Area',
        description: 'IoT devices deployment for smart city initiative',
        numberOfDevices: 0,
        openRequests: 0,
        status: 'Active',
        budget: 500000,
        expectedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
      },
      {
        projectId: 'PROJ-TEST-002',
        integratorId: 'test@integrator.com',
        name: 'Industrial Complex Security',
        location: 'North Industrial Zone',
        description: 'Security system integration for manufacturing facility',
        numberOfDevices: 0,
        openRequests: 0,
        status: 'Active',
        budget: 750000,
        expectedEndDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000) // 120 days from now
      }
    ];

    await Project.insertMany(sampleProjects);

    // Create sample devices with fault history
    const sampleDevices = [
      {
        serialNumber: 'EPB-001-2024',
        projectId: 'PROJ-TEST-001',
        integratorId: 'test@integrator.com',
        productType: 'Energizer Power Bank',
        model: 'EPB-5000',
        manufacturer: 'Energizer',
        status: 'Operational',
        faultHistory: [],
        location: 'Building A - Floor 1'
      },
      {
        serialNumber: 'GMC-002-2024',
        projectId: 'PROJ-TEST-001',
        integratorId: 'test@integrator.com',
        productType: 'Gate Motor Controller',
        model: 'GMC-X1',
        manufacturer: 'SecureTech',
        status: 'Faulty',
        location: 'Main Entrance',
        faultHistory: [
          {
            faultType: 'Communication Error',
            description: 'Device not responding to network commands',
            reportedDate: new Date('2024-01-10'),
            status: 'Open',
            reportedBy: 'Maintenance Team'
          }
        ]
      },
      {
        serialNumber: 'PA-003-2024',
        projectId: 'PROJ-TEST-001',
        integratorId: 'test@integrator.com',
        productType: 'Power Adapter',
        model: 'PA-120W',
        manufacturer: 'PowerTech',
        status: 'Under Repair',
        location: 'Server Room',
        faultHistory: [
          {
            faultType: 'Overheating',
            description: 'Device temperature exceeding safe limits',
            reportedDate: new Date('2024-01-08'),
            resolvedDate: new Date('2024-01-12'),
            status: 'Resolved',
            reportedBy: 'System Monitor',
            resolvedBy: 'Tech Team A',
            cost: 150
          },
          {
            faultType: 'Output Voltage Low',
            description: 'Output voltage below specification',
            reportedDate: new Date('2024-01-15'),
            status: 'In Progress',
            reportedBy: 'Field Engineer'
          }
        ]
      },
      {
        serialNumber: 'SPC-004-2024',
        projectId: 'PROJ-TEST-002',
        integratorId: 'test@integrator.com',
        productType: 'Solar Panel Controller',
        model: 'SPC-2000',
        manufacturer: 'SolarTech',
        status: 'Operational',
        location: 'Rooftop - Section B',
        faultHistory: [
          {
            faultType: 'Battery Charging Issue',
            description: 'Battery not reaching full charge',
            reportedDate: new Date('2023-12-20'),
            resolvedDate: new Date('2023-12-22'),
            status: 'Resolved',
            reportedBy: 'Monitoring System',
            resolvedBy: 'Solar Team',
            cost: 200
          }
        ]
      },
      {
        serialNumber: 'BC-005-2024',
        projectId: 'PROJ-TEST-002',
        integratorId: 'test@integrator.com',
        productType: 'Battery Charger',
        model: 'BC-12V',
        manufacturer: 'BatteryPro',
        status: 'Replaced',
        location: 'Backup Power Room',
        faultHistory: [
          {
            faultType: 'Hardware Failure',
            description: 'Internal component failure requiring replacement',
            reportedDate: new Date('2024-01-05'),
            resolvedDate: new Date('2024-01-10'),
            status: 'Resolved',
            reportedBy: 'Facility Manager',
            resolvedBy: 'Replacement Team',
            cost: 500
          }
        ]
      }
    ];

    await Device.insertMany(sampleDevices);

    // Update project device counts
    for (const project of sampleProjects) {
      const deviceCount = await Device.countDocuments({ projectId: project.projectId });
      const openRequests = await Device.aggregate([
        { $match: { projectId: project.projectId } },
        { $unwind: '$faultHistory' },
        { $match: { 'faultHistory.status': { $ne: 'Resolved' } } },
        { $count: 'openFaults' }
      ]);

      await Project.findOneAndUpdate(
        { projectId: project.projectId },
        {
          numberOfDevices: deviceCount,
          openRequests: openRequests.length > 0 ? openRequests[0].openFaults : 0
        }
      );
    }

    console.log('✅ Sample data seeded successfully!');
    console.log('📧 Test integrator email: test@integrator.com');
    console.log(`📱 Created ${sampleProjects.length} projects and ${sampleDevices.length} devices`);

  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    throw error;
  }
};

module.exports = {
  seedSampleData
};