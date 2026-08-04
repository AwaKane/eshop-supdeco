// Route d'authentification — vulnérabilités intentionnelles
const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const router = express.Router();

// ❌ VULN 1 — SQL Injection sur le login
// L'email est concaténé directement dans la requête SQL
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // ✓ Requête préparée — plus de concaténation
  const query = "SELECT * FROM users WHERE email = ? AND password = ?";

  db.get(query, [email, password], (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Erreur serveur" }); // ✓ pas de stack exposée
    }
    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET, // ✓ plus de secret hardcodé
      { expiresIn: "2h" }, // ✓ expiration ajoutée
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  });
});
// ❌ VULN 3 — Pas de rate limiting → brute force possible
router.post("/register", (req, res) => {
  const { email, password, username } = req.body;

  const query = `INSERT INTO users (email, password, username, role) VALUES (?, ?, ?, 'customer')`;

  db.run(query, [email, password, username], function (err) {
    if (err) {
      return res.status(500).json({ error: "Erreur serveur" });
    }
    res.json({ message: "Compte créé", id: this.lastID });
  });
});

module.exports = router;
