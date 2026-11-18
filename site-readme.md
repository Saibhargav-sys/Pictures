# Stillframe — Minimal Photography Website

A responsive, static photography website for GitHub Pages. No backend, account, or database required.

## Preview locally

Open `index.html` in a browser, or run `python3 -m http.server 8000` in this folder and visit `http://localhost:8000`.

## Publish to GitHub Pages

1. Sign in to GitHub. Do **not** share your password or personal access token.
2. Create a public repository named `YOUR_USERNAME.github.io` (replace `YOUR_USERNAME` with your actual GitHub username). Alternatively, use any repository name for a project site.
3. Upload `index.html`, `style.css`, `script.js`, and `images/` to the repository root, or push them with Git.
4. In **Settings → Pages → Build and deployment**, select **Deploy from a branch**, choose `main` and `/ (root)`, and save.
5. Visit `https://YOUR_USERNAME.github.io/`. For a project repository, use `https://YOUR_USERNAME.github.io/REPOSITORY_NAME/`.

## Add images

Only publish images you own or have explicit permission to redistribute. Put them in `images/`, then edit the `photos` array at the top of `script.js`:

```js
{title:'My Photograph',category:'Portraits',src:'images/my-photo.jpg'}
```

Available categories: Portraits, Nature, Architecture, Travel. To add categories, also add corresponding filter buttons in `index.html`.

The demo uses remote Unsplash image URLs as temporary examples; these depend on third-party availability and are not bundled with the website. Replace them before publication. GitHub Pages publishes website files publicly; it is not private storage.
