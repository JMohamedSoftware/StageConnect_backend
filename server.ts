import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import offerRoutes from './src/routes/offerRoutes.js';
import applicationRoutes from './src/routes/applicationRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import './src/db.js'; // Initialise la base SQLite au démarrage

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

// Route de santé
app.get('/api/health', (_req, res) => res.json({ status: 'ok', db: 'SQLite' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (SQLite)`));