import express from 'express';
import sequelize from './config/database';
import { login } from './controllers/authController';
import authRoutes from './routes/authRoutes';
import clientRoutes from './routes/clientRoutes';

const app = express();
const PORT = 4000;

app.use(express.json());
app.use((req, res, next) => {
  console.log('REQ', req.method, req.originalUrl, req.path);
  next();
});

app.use((req, res, next) => {
  if (req.method === 'POST' && req.originalUrl.includes('/api/auth/login')) {
    void login(req, res);
    return;
  }

  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);

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
