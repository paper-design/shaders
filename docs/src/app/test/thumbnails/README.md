These pages are used to create custom shader thumbnails for the Paper app. Shader settings are based on homepage thumbnails, but can be overridden in `app-thumbnails.ts`.

Workflow:

1. Merge `utils-to-save/generating-preview-pictures` into this branch locally
2. Open `localhost:3000/test/thumbnails/1` and go through every page, downloading the previews
   - There's 10 thumbs on each page because Chrome can download only up to 10 images at page load
3. Export downloaded images to WEBP using Pixelmator Pro with the following settings:
   - 0.5x size
   - Check "Convert to sRGB"
   - Quality: usually 99% or 100% (certain thumbnails are much smaller if lossless)
