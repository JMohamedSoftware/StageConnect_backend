import Database from 'better-sqlite3';

const db = new Database('../stageconnect.db');

try {
  console.log('Inserting company...');
  const stmt = db.prepare(`
    INSERT INTO users (name, email, password, role, company_name)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  let companyId;
  try {
     const result = stmt.run('Tech Recruiter', 'recruiter@tech.com', 'password123', 'company', 'Tech Innovators');
     companyId = result.lastInsertRowid;
  } catch(e) {
     if(e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        companyId = db.prepare("SELECT id FROM users WHERE email='recruiter@tech.com'").get().id;
     } else { throw e; }
  }

  console.log('Company ID:', companyId);

  // Check how many offers already exist? We delete old ones if any? No, just append.
  console.log('Inserting offers...');
  const insertOffer = db.prepare(`
    INSERT INTO offers (title, description, company_id, location, duration, domain, contract_type, status, work_mode)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'Hybride')
  `);
  
  insertOffer.run('Développeur Frontend React.js', 'Participez à la création de notre nouvelle web app ultra dynamique.', companyId, 'Paris, France', '6 mois', 'Développement Web', 'Stage');
  insertOffer.run('Consultant Data Analyst', 'Exploitez nos énormes volumes de données pour aiguiller les décisions.', companyId, 'Bordeaux (Hybride)', '4 mois', 'Data Science', 'Stage');
  insertOffer.run('UX/UI Product Designer', 'Repensez le parcours utilisateur de notre plateforme SAAS.', companyId, 'Lyon (Remote)', '6 mois', 'Design', 'Stage');
  insertOffer.run('Ingénieur Cybersécurité', 'Protégez nos systèmes d\'information contre les nouvelles menaces.', companyId, 'Rennes', '6 mois', 'Sécurité Informatique', 'Stage');
  insertOffer.run('Développeur Backend Node.js', 'Concevez et optimisez nos API pour un maximum de performances.', companyId, 'Nantes', '6 mois', 'Développement Web', 'Stage');
  insertOffer.run('Chef de Projet Digital', 'Coordonnez nos équipes et menez à bien la refonte de nos services.', companyId, 'Lille', '6 mois', 'Management', 'Stage');

  insertOffer.run('Consultant en Stratégie', 'Accompagnez nos clients dans leur transformation digitale.', companyId, 'Paris', '6 mois', 'Consulting', 'Stage');
  insertOffer.run('Développeur Mobile iOS/Android', 'Créez la nouvelle version de notre application mobile.', companyId, 'Bordeaux', '4 mois', 'Développement Mobile', 'Stage');

  console.log('Offers successfully inserted!');
} catch (error) {
  console.error("Error formatting DB!", error);
}
