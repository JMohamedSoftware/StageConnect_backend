import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Offer from './models/Offer.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stageconnect';

const seedDatabase = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected.");

    // 1. Clear existing data
    console.log("🧹 Cleaning database...");
    await User.deleteMany({});
    await Offer.deleteMany({});

    // 2. Hash default password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 3. Create Users
    console.log("👤 Creating users...");
    
    // Admin
    const admin = await User.create({
      name: 'Admin Principal',
      email: 'admin@stageconnect.tn',
      password: hashedPassword,
      role: 'admin',
      is_approved: true
    });

    // Companies
    const company1 = await User.create({
      name: 'Ahmed Ben Salem',
      email: 'contact@techvision.tn',
      password: hashedPassword,
      role: 'company',
      company_name: 'TechVision Innovate',
      sector: 'Informatique / SaaS',
      city: 'Tunis',
      is_approved: true
    });

    const company2 = await User.create({
      name: 'Sarra Jmour',
      email: 'jmour.sarra@creative.tn',
      password: hashedPassword,
      role: 'company',
      company_name: 'Creative Digital Agency',
      sector: 'Marketing & Design',
      city: 'Paris',
      is_approved: true
    });

    const company3 = await User.create({
      name: 'Firas Mansour',
      email: 'hr@dataminds.tn',
      password: hashedPassword,
      role: 'company',
      company_name: 'DataMinds Solutions',
      sector: 'Data Science / AI',
      city: 'Lyon',
      is_approved: true
    });

    // Students
    await User.create([
      { name: 'Yassine Labidi', email: 'yassine.labidi@esprit.tn', password: hashedPassword, role: 'student', is_approved: true },
      { name: 'Amira Guesmi', email: 'amira.guesmi@insat.tn', password: hashedPassword, role: 'student', is_approved: true },
      { name: 'Mohamed Ali', email: 'mohamed.ali@isg.tn', password: hashedPassword, role: 'student', is_approved: true }
    ]);

    console.log("✅ Users created.");

    // 4. Create Offers
    console.log("💼 Creating offers...");

    await Offer.create([
      // IT & Dev
      {
        title: 'Développeur Frontend React (PFE)',
        description: 'Nous recherchons un stagiaire passionné par React et TypeScript pour travailler sur notre nouvelle plateforme SaaS.',
        companyId: company1._id,
        location: 'Tunis (Lac 2)',
        duration: '6 mois',
        domain: 'IT & Dev',
        contractType: 'Stage',
        requirements: ['React.js', 'Typescript', 'Tailwind CSS'],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Fullstack Developer (Node.js / Vue.js)',
        description: 'Rejoignez notre équipe agile pour développer des APIs robustes et des interfaces intuitives.',
        companyId: company1._id,
        location: 'Remote',
        duration: '4-6 mois',
        domain: 'IT & Dev',
        contractType: 'Stage',
        requirements: ['Node.js', 'Vue.js', 'MongoDB'],
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Développeur Mobile Flutter',
        description: 'Création d\'une application mobile de gestion de stages.',
        companyId: company2._id,
        location: 'Tunis',
        duration: '5 mois',
        domain: 'IT & Dev',
        contractType: 'Stage',
        requirements: ['Flutter', 'Dart', 'Firebase'],
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
      },
      // Design
      {
        title: 'UI/UX Designer Junior',
        description: 'Conception d\'interfaces modernes pour nos clients internationaux.',
        companyId: company2._id,
        location: 'Sousse',
        duration: '4 mois',
        domain: 'Design',
        contractType: 'Stage',
        requirements: ['Figma', 'Adobe XD', 'Prototypage'],
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Graphiste / Illustrateur',
        description: 'Création visuelle pour réseaux sociaux et supports de communication.',
        companyId: company2._id,
        location: 'Remote',
        duration: '3 mois',
        domain: 'Design',
        contractType: 'Stage',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      },
      // Marketing
      {
        title: 'Growth Hacker / Digital Marketing',
        description: 'Mise en place de stratégies d\'acquisition client.',
        companyId: company2._id,
        location: 'Tunis',
        duration: '6 mois',
        domain: 'Marketing',
        contractType: 'Stage',
        requirements: ['SEO', 'Google Ads', 'Copywriting'],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      // Data
      {
        title: 'Data Scientist Intern',
        description: 'Analyse de données massives et création de modèles prédictifs.',
        companyId: company3._id,
        location: 'Lyon',
        duration: '6 mois',
        domain: 'Data',
        contractType: 'Stage',
        requirements: ['Python', 'Pandas', 'Scikit-learn'],
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Analyste BI (Business Intelligence)',
        description: 'Création de tableaux de bord financiers.',
        companyId: company3._id,
        location: 'Tunis',
        duration: '6 mois',
        domain: 'Data',
        contractType: 'Stage',
        requirements: ['PowerBI', 'SQL'],
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      },
      // Management / RH
      {
        title: 'Consultant Management Junior',
        description: 'Assistance à la gestion de projets transverses.',
        companyId: company3._id,
        location: 'Paris',
        duration: '6 mois',
        domain: 'Management',
        contractType: 'Stage',
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Chargé de Recrutement IT',
        description: 'Sourcing et entretiens de profils techniques.',
        companyId: company1._id,
        location: 'Tunis',
        duration: '6 mois',
        domain: 'RH',
        contractType: 'Stage',
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log("✅ Offers created.");
    console.log("\n🚀 Database seeding completed successfully!");
    console.log("\n--- Accounts created (Password: password123) ---");
    console.log("Admin:    admin@stageconnect.tn");
    console.log("Company1: contact@techvision.tn");
    console.log("Company2: jmour.sarra@creative.tn");
    console.log("Student:  yassine.labidi@esprit.tn");
    console.log("------------------------------------------------\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
