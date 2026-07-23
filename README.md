# E-Shop Pro — TP DevSecOps
**Cours 2INF2311 — Sécurité Logicielle & DevSecOps**  
**SUP de CO Dakar — Master 2 Génie Logiciel**

> ⚠️ **ATTENTION :** Ce code contient des vulnérabilités **intentionnelles** à des fins pédagogiques.  
> Ne jamais déployer en production.

---

## 📋 Objectif du TP

Construire une pipeline DevSecOps complète qui détecte automatiquement les vulnérabilités présentes dans ce projet.

## 🏗️ Architecture

```
E-Shop Pro (Node.js + Express + SQLite)
├── src/
│   ├── server.js          ← Point d'entrée
│   ├── routes/
│   │   ├── auth.js        ← Login/Register (SQLi ici)
│   │   ├── orders.js      ← Commandes (IDOR + Tampering)
│   │   ├── products.js    ← Produits (SQLi + Mass Assignment)
│   │   └── users.js       ← Utilisateurs (IDOR + Info Disclosure)
│   └── config/
│       └── database.js    ← SQLite
├── Dockerfile             ← Image non sécurisée
├── .github/workflows/
│   └── devsecops.yml      ← Pipeline à configurer
└── README.md
```

## 🔴 Vulnérabilités intentionnelles

| Fichier | Vulnérabilité | OWASP |
|---------|--------------|-------|
| `server.js` | Secrets hardcodés, CORS `*`, stack trace | A05, A02 |
| `routes/auth.js` | SQL Injection, JWT sans expiration, MDP en clair | A03, A07 |
| `routes/orders.js` | IDOR, Tampering prix, XSS Stocké | A01, A03 |
| `routes/products.js` | SQL Injection, Mass Assignment | A03, A04 |
| `routes/users.js` | IDOR, exposition MDP | A01, A02 |
| `Dockerfile` | Root user, image latest, debug port | A05 |

## 🚀 Installation locale

```bash
# Cloner le repo
git clone https://github.com/TON_USERNAME/eshop-pro.git
cd eshop-pro

# Installer les dépendances
npm install

# Démarrer
npm start
# → http://localhost:3000
```

## 🐳 Via Docker

```bash
docker build -t eshop-pro .
docker run -p 3000:3000 eshop-pro
```

## ⚙️ Configuration de la Pipeline

### Prérequis

1. **Semgrep** : Créer un compte sur [semgrep.dev](https://semgrep.dev) → récupérer le token
2. **Snyk** : Créer un compte sur [snyk.io](https://snyk.io) → récupérer le token

### Ajouter les secrets GitHub

```
Settings → Secrets and variables → Actions → New repository secret

SEMGREP_APP_TOKEN = ton_token_semgrep
SNYK_TOKEN        = ton_token_snyk
```

### Déclencher la pipeline

```bash
git add .
git commit -m "feat: initial commit — TP DevSecOps"
git push origin main
# → La pipeline se déclenche automatiquement
```

## 📊 Résultats attendus

Après exécution de la pipeline, tu dois voir dans l'onglet **Security → Code scanning** :

- **Semgrep** : SQLi, secrets hardcodés, XSS, CORS
- **Snyk** : CVE sur lodash, axios, express, jsonwebtoken
- **Trivy FS** : Vulnérabilités dans les dépendances npm
- **Trivy Image** : CVE dans l'image node:18

## ✅ Livrables TP3

- [ ] Lien du repo GitHub avec pipeline active
- [ ] Screenshot des résultats dans Security tab
- [ ] Au moins 2 vulnérabilités corrigées
- [ ] `RAPPORT_TP3.md` avec analyse et corrections

---

*SUP de CO Dakar — Cours 2INF2311*
