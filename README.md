# EPM Proposal System V2 — Complete Launch Version

This version is designed so you can finish setup and focus on getting clients.

## Included

- One-click EPM service buttons with professional descriptions
- Live proposal preview and totals
- Customer proposal link
- Text and email buttons
- Service agreement and electronic approval
- Scheduling status
- Completed status
- Zelle/cash payment reporting
- Admin Mark Paid action
- Professional digital receipt
- Searchable proposal records
- Call, text, and email shortcuts
- Delete proposal
- Downloadable JSON backup
- Persistent-storage support through `DATA_DIR`

## Replace GitHub files

Replace the flat files in your `epm-proposal-system` repository with the contents of this ZIP.

Keep the repository flat:

- package.json
- server.js
- proposals.js
- pages.js
- storage.js
- format.js
- proposalPage.js
- receiptPage.js
- EPM_Admin_Proposal_Generator_Flat_V2.html

## Render

Build command:
`npm install`

Start command:
`npm start`

Root directory:
leave blank

Environment variable:
`PUBLIC_BASE_URL=https://epm-proposal-system.onrender.com`

## Permanent storage

Render's default filesystem can reset during deployments.

For dependable records, add a Render persistent disk mounted at:

`/var/data`

Then add:

`DATA_DIR=/var/data`

After that, proposals survive redeployments and restarts.

## Verify

- https://epm-proposal-system.onrender.com/api/health
- https://epm-proposal-system.onrender.com/api/proposals/health

## Admin records

https://epm-proposal-system.onrender.com/proposals-admin

## Wix hidden page

Paste:

`EPM_Admin_Proposal_Generator_Flat_V2.html`

into the hidden Wix HTML embed.
