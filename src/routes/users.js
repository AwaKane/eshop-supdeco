// Route utilisateurs — vulnérabilités intentionnelles
const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const router = express.Router();

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token requis" });
  try {
    // ✅ Secret chargé depuis l'environnement, algorithme forcé explicitement
    req.user = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    next();
  } catch {
    res.status(403).json({ error: "Token invalide" });
  }
};

// ❌ VULN 1 — Exposition de données sensibles : tous les users accessibles
router.get("/", auth, (req, res) => {
  // ❌ Pas de vérification du rôle admin
  // Tout utilisateur authentifié peut lister tous les comptes
  db.all(
    "SELECT id, email, username, role, password FROM users",
    (err, users) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(users); // ❌ Retourne les mots de passe en clair !
    },
  );
});

// ✅ CORRIGÉ — IDOR : un utilisateur ne peut consulter que son propre profil
router.get("/:id", auth, (req, res) => {
  if (parseInt(req.params.id, 10) !== req.user.id) {
    return res.status(403).json({ error: "Accès non autorisé à ce profil" });
  }
  db.get(
    "SELECT id, email, username, role FROM users WHERE id = ?",
    [req.params.id],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user)
        return res.status(404).json({ error: "Utilisateur introuvable" });
      res.json(user); // ✅ Le mot de passe n'est plus sélectionné dans la requête
    },
  );
});

module.exports = router;
