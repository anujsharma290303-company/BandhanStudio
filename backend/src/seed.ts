import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import sequelize from './config/database';
import User from './models/User';

dotenv.config();

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const existingAdmin = await User.findOne({
      where: { username: 'admin' },
    });

    if (existingAdmin) {
      console.log('Admin already exists: username=admin');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash('changeme123', 10);

    await User.create({
      name: 'Studio Owner',
      username: 'admin',
      passwordHash,
      role: 'admin',
    });

    console.log('Admin created: username=admin, password=changeme123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();