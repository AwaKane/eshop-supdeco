// Route produits — vulnérabilités intentionnelles
const express = require('express');
const db      = require('../config/database');
const router  = express.Router();

// ❌ VULN 1 — SQL Injection sur la recherche
router.get('/search', (req, res) => {
  const { q } = req.query;

  // ❌ Concaténation directe → SQLi
  const query = `SELECT * FROM products WHERE name LIKE '%${q}%' OR description LIKE '%${q}%'`;

  db.all(query, (err, products) => {
    if (err) return res.status(500).json({ error: err.message, query }); // ❌ Query exposée
    res.json(products);
  });
});

// ❌ VULN 2 — Mass Assignment : req.body appliqué directement
router.put('/:id', (req, res) => {
  const updates = req.body; // ❌ L'attaquant peut passer isAdmin:true, price:0, etc.

  const fields = Object.keys(updates)
    .map(k => `${k} = '${updates[k]}'`)  // ❌ Injection SQL possible
    .join(', ');

  db.run(`UPDATE products SET ${fields} WHERE id = ${req.params.id}`,
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Produit mis à jour', changes: this.changes });
    }
  );
});

// Liste des produits — pas d'auth requise
router.get('/', (req, res) => {
  db.all('SELECT * FROM products', (err, products) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(products);
  });
});

module.exports = router;
