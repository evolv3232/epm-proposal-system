# EPM Proposal System V1 — Dedicated Service

This package is only for the new Render service:

https://epm-proposal-system.onrender.com

## Upload to the new GitHub repository

Upload the contents of this ZIP to the root of the new `epm-proposal-system` repository.

Repository structure:

- package.json
- src/
- data/
- EPM_Admin_Proposal_Generator_V1.html

## Render settings

- Service type: Web Service
- Build command: `npm install`
- Start command: `npm start`
- Root directory: blank
- Branch: main

Add this environment variable:

`PUBLIC_BASE_URL=https://epm-proposal-system.onrender.com`

Then deploy.

## Test

Open:

- https://epm-proposal-system.onrender.com/api/health
- https://epm-proposal-system.onrender.com/api/proposals/health

Both should return `"ok": true`.

## Wix hidden admin page

Paste the contents of:

`EPM_Admin_Proposal_Generator_V1.html`

into an HTML embed on your hidden Wix admin page.

When you create a proposal, the admin page returns:

- Copy Link
- Text Customer
- Email Customer
- Open Proposal

## Records

https://epm-proposal-system.onrender.com/proposals-admin
