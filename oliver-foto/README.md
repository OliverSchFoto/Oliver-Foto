# Oliver Foto

A dark, editorial photography portfolio designed for GitHub Pages, with a browser-based album manager and Google Drive folder integration.

## Included
- `index.html` — public portfolio
- `admin.html` — album manager
- `styles.css`, `admin.css` — styling
- `app.js` — public gallery and Google Drive image loading
- `admin.js` — add/remove albums and export JSON
- `config.js` — public site settings and album list

## 1. Publish on GitHub Pages
1. Create a GitHub repository named `oliver-foto` (or any name you prefer).
2. Upload all files from this folder to the repository root.
3. In the repository, open **Settings → Pages**.
4. Under Build and deployment, select **Deploy from a branch**.
5. Select `main` and `/ (root)`, then Save.
6. Wait for GitHub Pages to provide your website URL.

## 2. Set up Google Drive
1. Open [Google Cloud Console](https://console.cloud.google.com/) and create a project.
2. Enable **Google Drive API**.
3. Create an API key under **APIs & Services → Credentials**.
4. Restrict the key to the Google Drive API. Add an HTTP referrer restriction for your GitHub Pages domain, e.g. `https://YOUR-USERNAME.github.io/*` (and your custom domain if you use one).
5. Paste the key into `googleDriveApiKey` in `config.js`.
6. In Google Drive, open each album folder → Share → General access → **Anyone with the link — Viewer**.
7. Copy the folder URL and add it through `admin.html`.

Important: a browser-based site cannot keep a secret API key secret. A restricted, read-only API key is visible in the public JavaScript. Never put a password, OAuth client secret, service-account key, or write-enabled credential in this repository. Only share photos you are comfortable making public.

## 3. Add and publish albums
1. Open your deployed site's `/admin.html`.
2. Enter an album title, public Google Drive folder link, category and date.
3. Click **Add to album list**.
4. Click **Export albums.json**.
5. Open the downloaded file and copy its JSON array.
6. In your GitHub repository, edit `config.js`. Replace the contents of the `albums: [...]` array with the exported array.
7. Commit the change. GitHub Pages republishes the site.

The admin list is stored in the browser's local storage until exported. It is not a secure login and it does not directly commit to GitHub. Use the same browser/device for the local working list. The published site reads albums from `config.js`.

## Album object format
```json
{
  "title": "IFK Göteborg — Matchday",
  "folderId": "GOOGLE_DRIVE_FOLDER_ID",
  "category": "Football",
  "date": "2026-08-15",
  "description": "A selection from matchday."
}
```

## Notes
- The Drive folder must be accessible to anyone with the link for the public website to load its images.
- The API list endpoint currently reads up to 100 image files per folder.
- Google Drive thumbnail rendering depends on Drive permissions and may occasionally take a moment.
- Replace the sample hero image and contact email in `index.html` with your own choices before publishing.
