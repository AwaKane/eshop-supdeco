// Route utilisateurs — vulnérabilités intentionnelles
const express = require('express');
const jwt     = require('jsonwebtoken');
const db      = require('../config/database');
const router  = express.Router();

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requis' });
  try {
    req.user = jwt.verify(token, 'super_secret_jwt_key_123');
    next();
  } catch {
    res.status(403).json({ error: 'Token invalide' });
  }
};

// ❌ VULN 1 — Exposition de données sensibles : tous les users accessibles
router.get('/', auth, (req, res) => {
  // ❌ Pas de vérification du rôle admin
  // Tout utilisateur authentifié peut lister tous les comptes
  db.all('SELECT id, email, username, role, password FROM users', (err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(users); // ❌ Retourne les mots de passe en clair !
  });
});

// ❌ VULN 2 — IDOR : accès au profil de n'importe quel utilisateur
router.get('/:id', auth, (req, res) => {
  // ❌ Pas de vérification que req.params.id === req.user.id
  db.get('SELECT * FROM users WHERE id = ?', [req.params.id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(user); // Retourne les données de n'importe quel utilisateur
  });
});

module.exports = router;
