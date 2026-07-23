// Route d'authentification — vulnérabilités intentionnelles
const express = require('express');
const jwt     = require('jsonwebtoken');
const db      = require('../config/database');
const router  = express.Router();

// ❌ VULN 1 — SQL Injection sur le login
// L'email est concaténé directement dans la requête SQL
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // ❌ Concaténation directe → SQLi
  const query = `SELECT * FROM users WHERE email='${email}' AND password='${password}'`;

  db.get(query, (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // ❌ Stack exposée
    }
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // ❌ VULN 2 — JWT sans expiration + secret faible hardcodé
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      'super_secret_jwt_key_123', // ❌ Secret hardcodé + trop faible
      // Pas d'expiresIn → token valable indéfiniment
    );

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  });
});

// ❌ VULN 3 — Pas de rate limiting → brute force possible
router.post('/register', (req, res) => {
  const { email, password, username } = req.body;

  // ❌ Mot de passe stocké en clair (pas de hachage !)
  const query = `INSERT INTO users (email, password, username, role)
                 VALUES ('${email}', '${password}', '${username}', 'customer')`;

  db.run(query, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Compte créé', id: this.lastID });
  });
});

module.exports = router;
