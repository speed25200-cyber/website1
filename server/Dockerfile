FROM node:20-alpine
WORKDIR /app
# Le serveur n'a aucune dépendance npm : on copie le dépôt et on lance.
COPY .. /app
WORKDIR /app/server
ENV FC_PORT=8787
ENV FC_ROOT=/app
EXPOSE 8787
CMD ["node", "api.js"]
