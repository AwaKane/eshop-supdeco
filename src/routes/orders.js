// Route commandes — vulnérabilités intentionnelles
const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const router = express.Router();

// Middleware auth simplifié
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

// ✅ CORRIGÉ — IDOR : vérification de propriété avant de retourner la ressource
router.get("/:id", auth, (req, res) => {
  db.get("SELECT * FROM orders WHERE id = ?", [req.params.id], (err, order) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!order) return res.status(404).json({ error: "Commande introuvable" });
    if (order.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Accès non autorisé à cette commande" });
    }
    res.json(order);
  });
});

// ✅ CORRIGÉ (bonus) — Tampering + SQLi : prix relu depuis la BDD, requête paramétrée
router.post("/", auth, (req, res) => {
  const { productId, quantity } = req.body; // ✅ price n'est plus accepté depuis le client

  db.get(
    "SELECT price FROM products WHERE id = ?",
    [productId],
    (err, product) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!product)
        return res.status(404).json({ error: "Produit introuvable" });

      const total = product.price * quantity;

      db.run(
        "INSERT INTO orders (user_id, product_id, quantity, price, total) VALUES (?, ?, ?, ?, ?)",
        [req.user.id, productId, quantity, product.price, total],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: "Commande créée", id: this.lastID, total });
        },
      );
    },
  );
});

// ❌ VULN 3 — XSS Stocké : le commentaire est affiché sans encodage
router.post("/:id/comment", auth, (req, res) => {
  const { comment } = req.body;

  // ❌ Le commentaire est stocké sans sanitization
  db.run(
    "INSERT INTO comments (order_id, content) VALUES (?, ?)",
    [req.params.id, comment], // Comment peut contenir <script>...</script>
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Commentaire ajouté", content: comment }); // ❌ Reflété sans encodage
    },
  );
});

module.exports = router;
