# First Game

A browser fighting game built with HTML, CSS, and JavaScript.

## Play locally

Open `index.html` in a modern browser. For the best result, serve the folder with a local web server, such as VS Code Live Server.

## Controls

- `A` / `D`: Move and set facing direction
- `W`: Double jump
- `Space`: Normal attack
- Hold `S`, then release: Charged sword special
- `Esc` or `P`: Pause

## Charged special

The player has four mana charges. One mana charge returns every 3.5 seconds. Hold `S` for at least 0.35 seconds and release it to launch a sword slash. Charge it for up to 1.6 seconds to increase the slash size, speed, and damage.

## Deploy to GitHub Pages

This repository includes a GitHub Pages workflow. After pushing it to GitHub:

1. Open the repository on GitHub.
2. Select `Settings`, then `Pages`.
3. Under `Build and deployment`, choose `GitHub Actions` as the source.
4. Push to the `main` branch, or open `Actions` and run the `Deploy to GitHub Pages` workflow manually.
5. GitHub will show the published site URL in the workflow summary and in `Settings` > `Pages`.

[Deploy to GitHub Pages](../../actions/workflows/deploy-pages.yml)
