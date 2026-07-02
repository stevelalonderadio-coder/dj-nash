DJ NASH SYNC

Cette version règle le problème téléphone/laptop :
les photos DJ, la soirée, le DJ en direct et les demandes peuvent être synchronisés via Google Apps Script.

Installation rapide :
1. Upload les fichiers dans GitHub.
2. Crée un Google Sheet.
3. Dans Google Sheet : Extensions > Apps Script.
4. Colle le contenu de GOOGLE_APPS_SCRIPT.txt.
5. Déploie en Application Web.
6. Copie l'URL Web App.
7. Colle l'URL dans app.js : const BACKEND_URL = "URL_ICI";
8. Upload app.js modifié sur GitHub.

Sans BACKEND_URL, le site fonctionne encore en local, mais chaque appareil garde ses propres données.
