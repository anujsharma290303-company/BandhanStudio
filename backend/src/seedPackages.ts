import dotenv from 'dotenv';
import sequelize from './config/database';
import EventPackage from './models/EventPackage';

dotenv.config();

async function seedPackages() {
	await sequelize.authenticate();

	const existing = await EventPackage.count();
	if (existing > 0) {
		console.log('Packages already seeded. Skipping.');
		process.exit(0);
	}

	await EventPackage.bulkCreate([
		{
			name: 'Wedding Package',
			description: 'Full day wedding coverage',
			lineItems: [
				{ label: 'Photography (Full Day)', qty: 1, rate: 25000, amount: 25000 },
				{ label: 'Videography', qty: 1, rate: 20000, amount: 20000 },
				{ label: 'Drone Coverage', qty: 1, rate: 8000, amount: 8000 },
			],
		},
		{
			name: 'Pre-Wedding Package',
			description: 'Half day outdoor shoot',
			lineItems: [
				{ label: 'Photography (Half Day)', qty: 1, rate: 12000, amount: 12000 },
				{ label: 'Location Fee', qty: 1, rate: 3000, amount: 3000 },
			],
		},
		{
			name: 'Portrait Package',
			description: 'Studio portrait session',
			lineItems: [
				{ label: 'Studio Session (2 hrs)', qty: 1, rate: 5000, amount: 5000 },
				{ label: 'Edited Prints (Set of 10)', qty: 1, rate: 2000, amount: 2000 },
			],
		},
	]);

	console.log('3 fake event packages seeded.');
	process.exit(0);
}

seedPackages();