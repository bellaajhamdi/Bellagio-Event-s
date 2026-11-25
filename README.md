# Play Tech Manouba

Site vitrine avec catalogue et administration des produits, des services de réparation et des photos. Les demandes s'ouvrent dans WhatsApp ; aucun paiement ni stockage de formulaire client n'est intégré. Le catalogue est stocké dans Cloudflare D1, partagé entre visiteurs et administrateurs. Les photos téléchargées sont également stockées dans D1 (JPG, PNG ou WebP, 1 Mo maximum). Les photos d'origine sont des illustrations générées.

## Prévisualisation locale complète

Node.js 22 ou plus récent est requis.

```sh
npm ci
npm run build
npm run db:local
```

Créer ensuite un fichier `.dev.vars` **non versionné**, contenant `ADMIN_PASSWORD="un-mot-de-passe-long-et-unique"` (16 caractères minimum), puis lancer :

```sh
npm run dev:worker
```

Le site est accessible sur le port 8787, et l'administration à `/admin`. Les modifications sont stockées dans `.wrangler/` localement et ne sont pas publiées en ligne. Un nouveau `npm run build` est nécessaire après toute modification du code. `npm run dev` lance seulement Vite : il ne fournit ni base de données ni API d'administration.

## Déploiement depuis GitHub, sans terminal local

Le compte Cloudflare doit avoir accès à ce dépôt GitHub. Dans **Workers & Pages**, créez un Worker connecté à GitHub et sélectionnez ce dépôt ainsi que la branche de travail. Réglez la commande de compilation sur `npm run build` et la commande de déploiement sur `npm run deploy:cloudflare`. Le script crée la base D1 si nécessaire, applique les migrations, puis déploie le Worker ; le compte et le jeton de build gérés par Cloudflare doivent disposer des autorisations Workers et D1. Les étapes de provisionnement à distance doivent être vérifiées sur le compte Cloudflare, car elles ne sont pas testables sans connexion au compte.

Après la première publication, ouvrez les paramètres du Worker dans Cloudflare et ajoutez une variable **secrète** nommée `ADMIN_PASSWORD` contenant un mot de passe unique d'au moins 16 caractères. Enregistrez et redéployez si le tableau de bord le demande. Ne partagez jamais ce mot de passe. L'adresse du Worker s'affiche dans Cloudflare ; son administration se trouve à `/admin`. Un Worker portant déjà le même nom peut être remplacé : vérifiez avant la première publication.

## Hébergement Cloudflare Workers + D1

Un compte Cloudflare personnel est nécessaire. Les offres gratuites de Workers et D1 sont soumises à leurs quotas et conditions actuels ; un moyen de paiement peut être demandé par le fournisseur selon les services activés.

1. Dans un terminal sur votre ordinateur, ouvrez ce projet puis installez les dépendances : `npm ci`.
2. Connectez-vous à votre propre compte Cloudflare avec `npx wrangler login` (la connexion s’effectue dans votre navigateur). Si vous avez plusieurs comptes, sélectionnez le compte voulu ou configurez `CLOUDFLARE_ACCOUNT_ID` dans votre environnement local.
3. Lancez `npm run hosting:setup`. Le script demande confirmation avant de créer ou réutiliser la base `playtech-db`, applique les migrations manquantes, compile le site et publie le Worker `playtech-manouba`. Le fichier local `wrangler.deploy.json` contient l'identifiant de la base et n'est pas versionné. Le script affiche l'adresse publique fournie par Wrangler. Si un Worker du même nom existe déjà, ce déploiement le mettra à jour : vérifiez le compte avant de confirmer.
4. Activez l'administration en définissant un mot de passe fort et unique (au moins 16 caractères) à l'invite sécurisée : `npx wrangler secret put ADMIN_PASSWORD --config wrangler.deploy.json`. Ne partagez pas ce secret et ne l'inscrivez pas dans le code ou dans Git. L'administration reste fermée tant que ce secret n'est pas configuré.
5. Ajoutez `/admin` à l’adresse publiée pour gérer le catalogue et les photos. Les modifications sont immédiatement visibles sur le site. Protégez l'accès au compte Cloudflare avec une authentification forte et sauvegardez régulièrement la base D1.

Pour mettre à jour le code ensuite, relancez `npm run hosting:setup` ou exécutez `npm run build && npx wrangler deploy --config wrangler.deploy.json`. Les données D1 existantes ne sont pas écrasées lors d'un redéploiement. Les migrations ne sont appliquées qu'une fois ; ne recréez pas la base pour une mise à jour ordinaire. La base de l'aperçu local n'est pas transférée automatiquement : la base en ligne commence avec le catalogue initial, qu'il faudra ensuite mettre à jour depuis l'administration.

## Personnalisation et mot de passe administrateur

Dans l'administration, l'onglet **Réparations** permet d’ajouter, modifier, masquer et supprimer les prestations affichées sur la page Réparation, avec leurs tarifs et délais indicatifs. L’onglet **Personnalisation** permet de choisir l’ambiance, la couleur principale, les formes, les titres, l’espacement, les cartes, les boutons, la largeur et les effets lumineux, puis de publier ou de rétablir le style d’origine. Ces réglages sont enregistrés dans D1 et s'appliquent à tous les visiteurs.

L'onglet **Sécurité** permet de changer le mot de passe en fournissant l'ancien. Le nouveau mot de passe (16 caractères minimum) est enregistré sous forme de condensat PBKDF2 avec sel ; les sessions existantes sont invalidées. Le secret Cloudflare `ADMIN_PASSWORD` reste nécessaire comme clé de signature et mot de passe initial avant tout changement : ne le supprimez pas. Après un changement via l'administration, modifier ce secret seul ne modifie pas le mot de passe enregistré dans D1.

Si le mot de passe a été oublié, un administrateur du compte Cloudflare peut récupérer l'accès depuis le tableau de bord D1 : sauvegarder la base, puis supprimer uniquement la ligne `id = 1` de la table `admin_credentials` (ne pas supprimer les tables ni le catalogue). L'accès reviendra alors au secret Cloudflare `ADMIN_PASSWORD` ; connectez-vous et choisissez immédiatement un nouveau mot de passe dans l'onglet Sécurité. Cette opération invalide les sessions. Toute personne ayant accès à D1 ou aux secrets Cloudflare peut contrôler l'administration : sécurisez le compte Cloudflare et limitez les droits d'accès.

## Avant publication

Vérifiez auprès de la boutique les produits, prix, disponibilités, coordonnées, adresse exacte, horaires, services, délais et conditions commerciales. La carte indique Manouba, pas l'emplacement précis du magasin. Les prix du catalogue initial proviennent des publications Instagram et doivent être mis à jour. Les photos principales et photos produits peuvent être remplacées depuis `/admin`.
