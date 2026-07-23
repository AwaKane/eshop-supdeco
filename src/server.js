// E-Shop Pro — Serveur principal
// TP DevSecOps SUP de CO Dakar — Cours 2INF2311
// ATTENTION : Ce code contient des vulnérabilités intentionnelles à des fins pédagogiques

const express = require('express');
const dotenv  = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ❌ VULN 1 — Security Misconfiguration : pas de headers de sécurité
// Fix : app.use(require('helmet')());

// ❌ VULN 2 — Secret hardcodé (détectable par GitLeaks/Semgrep)
const JWT_SECRET   = "super_secret_jwt_key_123";
const DB_PASSWORD  = "admin1234";
const API_KEY      = "sk_test_EXEMPLE_INTENTIONNELLEMENT_VULNERABLE";
const STRIPE_KEY   = "sk_live_EXEMPLE_INTENTIONNELLEMENT_VULNERABLE";

// ❌ VULN 3 — CORS trop permissif
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Jamais '*' avec auth !
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/users',    require('./routes/users'));

// ❌ VULN 4 — Stack trace exposée en production
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message,
    stack: err.stack, // Ne jamais exposer la stack en production !
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`E-Shop Pro démarré sur le port ${PORT}`);
});

module.exports = app;
