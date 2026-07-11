import express from 'express';
import sequelize from './config/database';

import './models/User';
import './models/Client';
import './models/EventPackage';
import './models/Quotation';
import './models/Bill';

import authRoutes from './routes/authRoutes';
import clientRoutes from './routes/clientRoutes';
import quotationRoutes from './routes/quotationRoutes';
import eventPackageRoutes from './routes/eventPackageRoutes';

import cors from 'cors';


const app = express();
const PORT = 4000;
app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true,
}));
app.use(express.json());


// Optional: logs every incoming request, useful while debugging routes.
// Safe to remove once things are stable.
app.use((req, res, next) => {
	console.log('REQ', req.method, req.originalUrl);
	next();
});

app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/event-packages', eventPackageRoutes);

async function start() {
	try {
		await sequelize.authenticate();
		console.log('Database connected successfully.');

		await sequelize.sync({ alter: true });
		console.log('Models synced.');

		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	} catch (err) {
		console.error('Unable to connect to the database:', err);
	}
}

start();