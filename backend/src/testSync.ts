import dotenv from 'dotenv';
dotenv.config();
import sequelize from './config/database';
import './models/User';
import './models/Client';
import './models/EventPackage';
import './models/Quotation';
import './models/Bill';

async function run() {
  console.log('Starting sync...');
  const start = Date.now();
  await sequelize.sync({ force: true });
  console.log('Sync finished in', Date.now() - start, 'ms');
  await sequelize.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});