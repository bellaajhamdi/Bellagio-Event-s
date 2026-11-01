# Bellagio Event’s

Site événementiel en français, responsive, inspiré du site Bellagio Event’s, avec une administration et des demandes de visite persistantes.

## Démarrage

Prérequis : Node.js 22 et npm.

```sh
npm ci
npm start
```

Le serveur écoute sur `0.0.0.0:3000` (`PORT` configurable). Le site est accessible à `/` et l’administration à `/admin`.

## Connexion administrateur

Définir `ADMIN_PASSWORD` dans l’environnement avant le démarrage pour choisir le mot de passe. À défaut, le premier lancement génère un mot de passe aléatoire dans `data/admin-password` (fichier local ignoré par Git). Pour le consulter :

```sh
cat data/admin-password
```

Aucun mot de passe n’est intégré au code. Les sessions durent huit heures, utilisent des cookies HttpOnly / SameSite strict et sont invalidées à la déconnexion et au redémarrage du serveur. Les tentatives de connexion sont limitées. En HTTPS, le cookie est sécurisé.

## Fonctionnalités

- Accueil et pages dédiées : `/nos-espaces`, `/espaces/la-salle`, `/espaces/le-jardin`, `/a-propos`, `/formules`, `/galerie`, `/contact`.
- Galerie filtrable, agrandissement, témoignages et animations progressives respectant les préférences de mouvement réduit.
- Simulateur de devis : formules, capacité, date, options, tarifs semaine/week-end et remise saisonnière. Export du projet vers WhatsApp ou préremplissage du formulaire de contact. Les forfaits soirée restent des estimations de départ : les majorations par capacité/date non accessibles ne sont pas inventées. Les jours fériés et leurs veilles sont signalés manuellement par l’utilisateur, pas calculés automatiquement.
- Demande de visite avec validation côté client et serveur.
- Administration : compteurs, recherche, filtres, changement de statut (nouvelle, contactée, confirmée, archivée), export CSV.
- Modification du titre, de la présentation et des coordonnées depuis l’administration.
- Persistance dans `data/store.json` ; sauvegarder ce répertoire. `DATA_DIR` permet un emplacement alternatif.

## Vérifications

```sh
npm test
```

Les tests utilisent des données temporaires et couvrent les pages publiques, la protection de l’administration, la connexion, la validation des demandes, les changements de statut, la modification de contenu et la déconnexion. Des tests DOM vérifient également les interactions du simulateur, les contraintes des formules et la galerie. Les calculs de prix et limites de la remise saisonnière sont testés séparément.

## Avant mise en production

- Définir un mot de passe administrateur fort via les variables d’environnement de l’hébergeur, activer HTTPS et utiliser un volume persistant pour `data/`.
- Cette version utilise un stockage fichier adapté à une instance unique. Pour plusieurs instances, migrer les données et les sessions vers une base partagée.
- Les demandes sont enregistrées dans l’administration ; aucun e-mail ou SMS automatique n’est envoyé.
- Les images de la salle et du jardin sont référencées depuis le site fourni. Héberger les fichiers autorisés localement avant publication. Les polices Google disposent de polices de repli.
- Vérifier les coordonnées, formules, horaires, témoignages et droits des images avant publication. Les tarifs accessibles de la page formules sont reproduits dans le simulateur et signalés comme indicatifs ; le prix final doit être confirmé.
- Ajouter les mentions légales et les informations relatives à la conservation des données adaptées à l’exploitant.

## Déploiement d’essai Render

Le fichier `render.yaml` prépare un service web **gratuit**, sans disque payant. Dans Render, créer un Blueprint à partir de ce dépôt et sélectionner la branche `arena/9ff97c49-bellagio-event-s`. Renseigner la variable secrète `ADMIN_PASSWORD` dans Render. Le lien public n’existe qu’une fois le déploiement validé et terminé sur le compte de l’utilisateur.

**Limites de l’essai** : le service peut se mettre en veille et le système de fichiers est éphémère. Les demandes et modifications peuvent être perdues lors des redémarrages ou déploiements. Ne pas utiliser cet essai comme stockage de véritables réservations. Pour la production, prévoir un disque persistant ou une base de données, puis ajouter le domaine dans le tableau de bord de l’hébergeur.

L’administration accepte aussi un jeton de session via l’en-tête Authorization, conservé uniquement dans le sessionStorage de l’onglet. Cela permet de fonctionner dans un aperçu intégré où les cookies tiers sont bloqués. Le mot de passe n’est pas conservé dans le navigateur.
