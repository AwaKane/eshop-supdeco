// Route produits — vulnérabilités intentionnelles
const express = require("express");
const db = require("../config/database");
const router = express.Router();

// ✅ CORRIGÉ — Requête paramétrée, plus de concaténation ni de fuite de la query en erreur
router.get("/search", (req, res) => {
  const { q } = req.query;
  const like = `%${q}%`;

  db.all(
    "SELECT * FROM products WHERE name LIKE ? OR description LIKE ?",
    [like, like],
    (err, products) => {
      if (err) return res.status(500).json({ error: "Erreur serveur" });
      res.json(products);
    },
  );
});

// ✅ CORRIGÉ — Whitelist des champs autorisés + requête paramétrée
const _ = require("lodash");
const ALLOWED_PRODUCT_FIELDS = ["name", "description", "price", "stock"];

router.put("/:id", (req, res) => {
  const updates = _.pick(req.body, ALLOWED_PRODUCT_FIELDS); // ✅ Seuls ces champs peuvent être modifiés
  const keys = Object.keys(updates);

  if (keys.length === 0) {
    return res
      .status(400)
      .json({ error: "Aucun champ valide à mettre à jour" });
  }

  const setClause = keys.map((k) => `${k} = ?`).join(", "); // ✅ Noms de colonnes fixes (whitelist), jamais de valeurs utilisateur ici
  const values = keys.map((k) => updates[k]);

  // Faux positif Semgrep sur la ligne suivante : setClause est construit UNIQUEMENT
  // à partir de ALLOWED_PRODUCT_FIELDS (whitelist figée ligne 23), jamais depuis une
  // entrée utilisateur brute. Les valeurs passent par des placeholders '?' paramétrés.
  // nosemgrep: sql-injection-template-literal
  db.run(
    `UPDATE products SET ${setClause} WHERE id = ?`,
    [...values, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Produit mis à jour", changes: this.changes });
    },
  );
});

// Liste des produits — pas d'auth requise
router.get("/", (req, res) => {
  db.all("SELECT * FROM products", (err, products) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(products);
  });
});

module.exports = router;
