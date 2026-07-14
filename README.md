# EPM Proposal System — Flat Repository Version

This version matches the exact GitHub layout already visible in your repository.

The repository root should contain:

- package.json
- server.js
- proposals.js
- pages.js
- storage.js
- format.js
- proposalPage.js
- EPM_Admin_Proposal_Generator_Flat_V1.html
- README.md

There is no `src` folder.

## Replace the files in GitHub

Delete or replace the current files with the files from this package.

The important correction is:

```json
"start": "node server.js"
```

## Render settings

- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: blank
- Branch: main

Then select:

Manual Deploy → Clear build cache & deploy

## Verify

Open:

- https://epm-proposal-system.onrender.com/api/health
- https://epm-proposal-system.onrender.com/api/proposals/health

Both should return `"ok": true`.

## Wix

Paste the complete contents of:

`EPM_Admin_Proposal_Generator_Flat_V1.html`

into the hidden Wix HTML embed.
