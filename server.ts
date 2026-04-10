import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import offerRoutes from './src/routes/offerRoutes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/offers', offerRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok', db: 'MongoDB' }));

const MONGO_URI = process.env.MONGO_URI || '';
if (!MONGO_URI) {
    console.error('❌ MONGO_URI manquant dans .env !');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB connecté !");
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
    })
    .catch(err => {
        console.error("❌ Erreur MongoDB:", err.message);
        console.error("\n👉 Solution : Utilisez MongoDB Atlas (gratuit) :");
        console.error("   1. Allez sur https://www.mongodb.com/atlas");
        console.error("   2. Créez un cluster gratuit");
        console.error("   3. Copiez le connection string dans .env (MONGO_URI=...)");
        process.exit(1);
    });