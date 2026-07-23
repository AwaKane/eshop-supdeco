// Route commandes — vulnérabilités intentionnelles
const express = require('express');
const jwt     = require('jsonwebtoken');
const db      = require('../config/database');
const router  = express.Router();

// Middleware auth simplifié
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requis' });
  try {
    // ❌ Pas de vérification de l'algorithme → algorithm:none possible
    req.user = jwt.verify(token, 'super_secret_jwt_key_123');
    next();
  } catch {
    res.status(403).json({ error: 'Token invalide' });
  }
};

// ❌ VULN 1 — IDOR : pas de vérification de propriété
// Un utilisateur peut accéder aux commandes de N'IMPORTE QUEL autre utilisateur
router.get('/:id', auth, (req, res) => {
  // ❌ Pas de vérification que req.params.id === req.user.id
  db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, order) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });
    res.json(order); // Retourne la commande de n'importe quel utilisateur
  });
});

// ❌ VULN 2 — Tampering : l'API utilise le prix envoyé par le client
router.post('/', auth, (req, res) => {
  const { productId, quantity, price } = req.body; // ❌ price vient du client !

  // ❌ On fait confiance au prix envoyé par le client
  const total = price * quantity;

  const query = `INSERT INTO orders (user_id, product_id, quantity, price, total)
                 VALUES (${req.user.id}, ${productId}, ${quantity}, ${price}, ${total})`;

  db.run(query, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Commande créée', id: this.lastID, total });
  });
});

// ❌ VULN 3 — XSS Stocké : le commentaire est affiché sans encodage
router.post('/:id/comment', auth, (req, res) => {
  const { comment } = req.body;

  // ❌ Le commentaire est stocké sans sanitization
  db.run(
    'INSERT INTO comments (order_id, content) VALUES (?, ?)',
    [req.params.id, comment], // Comment peut contenir <script>...</script>
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Commentaire ajouté', content: comment }); // ❌ Reflété sans encodage
    }
  );
});

module.exports = router;
