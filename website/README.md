# Sephora E-Sports Website

This folder contains a small static website for the Sephora E-Sports Discord / TikTok integration.

Pages:

- `index.html` - Home
- `privacy/index.html` - Privacy Policy
- `terms/index.html` - Terms of Service

The site uses only static HTML and CSS. It does not require PHP, Node.js, a database, a backend, analytics, tracking scripts, or cookies.

## Required owner information before publishing

The Privacy Policy and Terms of Service intentionally contain `[OWNER INFORMATION REQUIRED]` placeholders. Replace them with real operator details before using the website for a live TikTok Developer App.

Do not invent these details. Use the real responsible person or organization.

At minimum, check whether you need to add:

- Legal name of the responsible operator or organization
- Contact email address for privacy and service requests
- Postal address, if legally required for your location
- Country or jurisdiction of the operator, if legally required
- Any additional local legal notices required for your region

## Publish with GitHub Pages

GitHub Pages branch deployment usually supports only the repository root or a `docs/` folder. Because this site intentionally lives in `website/`, the recommended setup is GitHub Actions.

1. Keep this folder at `website/` in your repository.
2. Create this workflow file in the repository:
   `.github/workflows/pages.yml`
3. Add the following workflow:

```yaml
name: Deploy static website to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload website folder
        uses: actions/upload-pages-artifact@v3
        with:
          path: website

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

4. Commit and push `website/` and `.github/workflows/pages.yml`.
5. In the repository on GitHub, open **Settings > Pages**.
6. Under **Build and deployment**, set **Source** to **GitHub Actions**.
7. Run the workflow or push to `main`.
8. Wait for the deployment to finish.
9. Open the published URL and verify these paths:
   - `/`
   - `/privacy/`
   - `/terms/`

## Alternative setup with `docs/`

If you prefer GitHub's built-in branch deployment without Actions:

1. Rename `website/` to `docs/`, or copy the contents of `website/` into `docs/`.
2. Commit and push the folder.
3. In **Settings > Pages**, choose **Deploy from a branch**.
4. Select your branch, usually `main`, and the `/docs` folder.
5. Save and wait for deployment.

## TikTok Developer App notes

Use the final GitHub Pages URLs for the app registration fields required by TikTok, for example:

- Website URL: your published home page URL
- Privacy Policy URL: your published `/privacy/` URL
- Terms of Service URL: your published `/terms/` URL

Before submitting the app, replace every `[OWNER INFORMATION REQUIRED]` placeholder with real owner/contact information.
