# Gestion des Médias - Sovkipik

Pour importer les images et médias de votre ancien site vers cette nouvelle version, suivez ces instructions.

## 1. Où placer vos fichiers ?

J'ai créé un dossier pour vous : `public/media`

C'est ici que vous devez **copier/coller** toutes vos images, vidéos et documents.

**Chemin complet :**
`C:\Users\court\Desktop\Siteapps\Sovkipik\public\media\`

## 2. Comment les utiliser dans vos articles ?

Une fois une image placée dans ce dossier (exemple : `mon-herisson.jpg`), vous pouvez l'afficher dans vos articles Markdown (`.md`) comme ceci :

```markdown
![Légende de l'image](/media/mon-herisson.jpg)
```

**Note :** Le chemin commence toujours par `/media/`.

## 3. Astuces

*   **Organisation** : Vous pouvez créer des sous-dossiers dans `public/media` (par exemple `public/media/2023`, `public/media/soins`) pour mieux vous organiser.
*   **Astro Assets** : Pour des performances optimales plus tard, nous pourrons déplacer certaines images clés vers `src/assets`, mais pour l'instant, `public/media` est la méthode la plus simple pour une migration rapide.
