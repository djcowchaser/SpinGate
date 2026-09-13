# SpinGate

A dependency-free static web app for choosing a Splitgate Quick Play gamemode and compatible map.

Use **Configure game modes and maps** in the page to build the rotation in three steps: add gamemodes, create named map lists, and link each gamemode to the list it can use. Each text area accepts one value per line and is saved in that browser. A selected gamemode or map cannot appear again until at least 50% of its alternatives have appeared.

## Run locally

Open `index.html` in a browser.

## Deploy with GitHub Pages

1. Push this project to a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **GitHub Actions** as the source.
4. Push to `main`. The included workflow publishes the site automatically.

GitHub Pages from a private repository requires an eligible paid GitHub plan. The published site is public unless the repository belongs to a GitHub Enterprise Cloud organization configured for private Pages.
