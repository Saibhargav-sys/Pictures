# Stillframe

A simple photo gallery hosted on GitHub Pages.

## Add photos from your phone

The site is static, so it cannot safely write uploads back to GitHub by itself. Use GitHub's website to add photos; the Pages workflow publishes them automatically.

1. Open the [images folder](https://github.com/Saibhargav-sys/Pictures/tree/main/images) in your browser to add photos to Explore, or the [Spotlight folder](https://github.com/Saibhargav-sys/Pictures/tree/main/images/spotlight) to feature selected photos on Home.
2. Select **Add file → Upload files** and choose photos from your device.
3. Commit the upload to `main`.
4. Wait for the **Deploy to GitHub Pages** workflow to finish. The photos will then appear on the site.

Photos in Explore also appear in Spotlight when uploaded to `images/spotlight/`. Use `.jpg`, `.jpeg`, `.png`, or `.webp` images. Keep files reasonably small for faster page loads. Uploaded photos become public on this repository and website.

## Local preview

Run `python3 -m http.server 8000` from the repository root and open `http://localhost:8000`. To preview newly added images locally, run `python3 scripts/build-photo-manifest.py` first.
