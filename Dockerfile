# ❌ Dockerfile NON sécurisé — vulnérabilités intentionnelles pour le TP DevSecOps
# Les étudiants doivent identifier et corriger ces problèmes

# ❌ VULN 1 — Image de base non spécifique (latest = non reproductible)
FROM node:18

# ❌ VULN 2 — Exécution en tant que root
# Fix : USER node

WORKDIR /app

# ❌ VULN 3 — Copie de TOUT le répertoire (inclut .env, .git, node_modules)
COPY . .

# ❌ VULN 4 — npm install au lieu de npm ci (non reproductible)
RUN npm install

# ❌ VULN 5 — Port debug exposé
EXPOSE 3000
EXPOSE 9229

# ❌ VULN 6 — Démarrage en mode debug (--inspect expose le debugger)
CMD ["node", "--inspect=0.0.0.0:9229", "src/server.js"]
