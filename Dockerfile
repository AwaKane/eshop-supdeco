# ✅ Dockerfile sécurisé — E-Shop Pro

# ✅ Image de base pinnée (version exacte + variante alpine = surface d'attaque réduite et build reproductible)
FROM node:18.20.4-alpine3.20

WORKDIR /app

# ✅ On copie d'abord uniquement les manifests : meilleur cache Docker, et on isole
#    l'installation des dépendances du reste du code source
COPY package.json package-lock.json ./

# ✅ npm ci au lieu de npm install : installation strictement reproductible depuis
#    package-lock.json (pas de résolution de version au moment du build), et --omit=dev
#    exclut les dépendances de développement de l'image finale
RUN npm ci --omit=dev

# ✅ Copie du code source uniquement (le reste — .env, .git, node_modules, .semgrep,
#    .github — est exclu via .dockerignore, voir fichier associé)
COPY src ./src

# ✅ Utilisateur non-root fourni nativement par l'image officielle node:alpine (uid 1000)
USER node

# ✅ Seul le port applicatif est exposé — plus de port de debug 9229
EXPOSE 3000

# ✅ Démarrage normal, sans --inspect (le mode debug ne doit jamais tourner en production)
CMD ["node", "src/server.js"]