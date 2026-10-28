AH ARCADE — COMING SOON / INSERT COIN
====================================

A standalone, static placeholder for arcade.adrianheadley.com.
It is SEPARATE from the main Arcade website.

Deploy:
  1. Extract the ZIP.
  2. Upload the CONTENTS to your website's public root.
  3. Open index.html. No build steps or backend needed.

Experience:
  - Full-screen 1980s attract screen: COMING SOON / INSERT COIN FOR A PEEK.
  - Click/tap anywhere, or press Enter or Space, to reveal the preview.
  - Brief AH Arcade introduction and a smoother one-button 8-bit runner.
  - Calm midnight-city mini-game artwork; site information sits below the game.
  - Space / Up / W / tap the game to jump; P pauses; R restarts.
  - Best mini-game score is stored ONLY in this browser.
  - Sound is generated locally using Web Audio; it can be muted.

404:
  - /404.html has a matching retro error screen and return link.
  - Apache: .htaccess enables the custom 404 (hidden file: upload it).
  - Netlify: _redirects handles 404 routing.
  - Cloudflare Pages: 404.html is detected by the platform.
  - Other static hosts: set /404.html as the custom error page in hosting settings.
  - This page loads CSS and JS with root-relative paths so nested missing URLs
    keep the correct design. The 404 has additional built-in critical styling.

No external fonts, libraries, trackers, cookies, ads or launch countdowns.
No content from the unfinished full Arcade is publicly exposed.
