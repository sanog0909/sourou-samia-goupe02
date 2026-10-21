# Plan de conception — SOUROU SAMIA

## Portée et approche

Site vitrine statique en français pour la Coopérative Céréalière du Sourou, livré en HTML5, CSS3 et JavaScript léger. Il fonctionne sur un serveur local ou intranet avec des fichiers d’images locaux, sans dépendance à un service météo, à une police web ou à un CDN. L’accueil présente un bilan pluviométrique régional récent de l’ANAM-BF, avec un lien vers la source. Les valeurs de stock, de prix et d’effectif seront affichées après communication par la coopérative, plutôt que d’être inventées.

Le site comprend cinq pages liées : accueil, catalogue des céréales, fiches d’intrants, espace acheteur et présentation de la coopérative. Le catalogue présente Maïs, Sorgho et Petit mil ainsi que leurs champs commerciaux. Les favoris persistent sur l’appareil via `localStorage`. Le formulaire de rendez-vous rassemble localement une date, un type de visite et un volume. Les comptes acheteurs et la transmission d’une demande nécessiteraient des services côté serveur distincts, absents de cette version statique.

## Direction artistique

- **Mouvement** : édition agricole contemporaine, à la croisée du carnet de coopérative, de l’affiche sérigraphiée et du magazine de terroir.
- **Principes** : ancrage géographique sans folklore décoratif ; information lisible au premier regard ; textures discrètes et matériaux chaleureux ; parcours acheteur court.
- **Couleurs** : vert profond pour la vallée et la confiance, argile rouge-brun pour le sol, jaune céréale pour la vitalité, ivoire pour la lisibilité. Le vert Sourou est `#245C43`.
- **Mise en page** : composition éditoriale décentrée, photographie de territoire en grande largeur, titres alignés à gauche, bandeaux horizontaux et cartes aux proportions variées.
- **Signatures visuelles** : logo illustré des trois céréales fourni par l’utilisatrice ; lignes de sillons ; tampons typographiques pour les catégories.
- **Interactions** : favoris visibles et accessibles au clavier ; filtres du catalogue ; formulaire présentant clairement le résultat de la préparation locale.
- **Animation** : transitions courtes et discrètes sur les cartes et les liens ; respecter `prefers-reduced-motion`.
- **Typographie** : Georgia ou Times New Roman pour les titres, Arial ou la police système pour les données et l’interface, afin de préserver le fonctionnement hors ligne.
- **Essence de marque** : « Les récoltes du Sourou, visibles, situées et faciles à rencontrer. » Caractère : direct, ancré, fiable.
- **Voix** : concrète et chaleureuse, sans promesse non vérifiée. Formules de marque : « Du Sourou au marché, sans détour. » ; « Découvrir les céréales de la vallée. »
- **Logo** : employer le logo fourni, recadré et doté d’un fond transparent. Utiliser l’emblème seul dans l’en-tête, la composition complète dans la page d’accueil et l’emblème comme favicon.
- **Couleur propriétaire** : vert Sourou `#245C43`.

## Structure du projet

- `index.html` : identité, mission, pluviométrie récente et accès au catalogue.
- `produits.html` : trois catégories de céréales, champs d’information commerciale, filtres et favoris.
- `intrants.html` : cinq fiches techniques des engrais et semences prescrits dans le cahier des charges.
- `acheteurs.html` : accès acheteur, favoris locaux et préparation d’un rendez-vous.
- `apropos.html` : mission, territoire et fonctionnement collectif.
- `css/styles.css` : système graphique partagé, responsive et accessible.
- `js/app.js` : menu mobile, filtres, favoris et formulaires locaux.
- `assets/` : logo fourni et déclinaisons web, photos des céréales et du territoire, icônes de repli.
- `docs/pluviometrie.md` : sources et portée des données météorologiques intégrées.
- `manus-routes.json` : manifeste des cinq pages pour l’aperçu WebDev.
- `README.md` et `TODO.md` : guide d’installation, état fonctionnel et données attendues.

## Contraintes

Aucun framework ou service externe n’est requis au chargement des pages. Les chemins d’images du catalogue sont relatifs. Les formulaires d’acheteur n’envoient pas les renseignements hors de l’appareil ; aucun mot de passe n’est demandé. Les libellés, textes alternatifs, états de focus et contrastes soutiennent l’accessibilité clavier et mobile.
