
import express from "express";
import { readProposals, storageInfo } from "./storage.js";
import { escapeHtml, money, formatDateTime } from "./format.js";
import { renderReceiptPage } from "./receiptPage.js";

const router = express.Router();

router.get("/proposals-admin", (req, res) => {
  const proposals = readProposals();

  const cards = proposals.map(proposal => `
    <article class="card" data-search="${escapeHtml((proposal.proposalNumber+" "+proposal.customer?.name+" "+proposal.propertyAddress+" "+proposal.status).toLowerCase())}">
      <div class="top"><div><h3>${escapeHtml(proposal.customer?.name)}</h3><p>${escapeHtml(proposal.propertyAddress)}</p></div><strong>${money(proposal.total)}</strong></div>
      <p><b>${escapeHtml(proposal.proposalNumber)}</b> · ${escapeHtml(proposal.status)}</p>
      ${proposal.scheduledFor ? `<p>Scheduled: ${escapeHtml(formatDateTime(proposal.scheduledFor))}</p>` : ""}
      <div class="actions">
        <a href="/proposal/${encodeURIComponent(proposal.proposalNumber)}" target="_blank">Open</a>
        ${proposal.customer?.phone ? `<a href="tel:${escapeHtml(proposal.customer.phone)}">Call</a><a href="sms:${escapeHtml(proposal.customer.phone)}">Text</a>` : ""}
        ${proposal.customer?.email ? `<a href="mailto:${escapeHtml(proposal.customer.email)}">Email</a>` : ""}
        <button onclick="schedule('${escapeHtml(proposal.proposalNumber)}')">Schedule</button>
        <button onclick="updateStatus('${escapeHtml(proposal.proposalNumber)}','complete')">Complete</button>
        <button onclick="markPaid('${escapeHtml(proposal.proposalNumber)}')">Mark Paid</button>
        ${proposal.status === "Paid" ? `<a href="/receipt/${encodeURIComponent(proposal.proposalNumber)}" target="_blank">Receipt</a>` : ""}
        <button class="danger" onclick="removeProposal('${escapeHtml(proposal.proposalNumber)}')">Delete</button>
      </div>
    </article>`).join("");

  res.send(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>EPM Proposal Records</title><style>
  body{font-family:Arial;background:#f4f7f3;padding:16px;color:#061b33}.wrap{max-width:1100px;margin:auto}
  header{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:14px}input{width:100%;padding:12px;border:1px solid #bbb;border-radius:9px}
  .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.card{background:white;padding:16px;border-radius:14px;border:1px solid #d7e4d2}
  .top{display:flex;justify-content:space-between;gap:10px}.top h3{margin:0}.top p{margin:4px 0;color:#64748b;font-size:13px}
  .actions{display:flex;flex-wrap:wrap;gap:7px}.actions a,.actions button{border:0;border-radius:8px;padding:8px 10px;background:#e9eef3;color:#061b33;text-decoration:none;font-weight:bold;cursor:pointer}.actions .danger{background:#fee2e2;color:#991b1b}
  .footer{margin-top:16px;color:#64748b;font-size:12px}
  @media(max-width:700px){.grid{grid-template-columns:1fr}header{display:block}}
  </style></head><body><div class="wrap"><header><div><h1>EPM Proposal Records</h1><p>Manage approvals, scheduling, completion, payments, and receipts.</p></div><a href="/api/proposals-export" target="_blank">Export Backup</a></header>
  <input id="search" placeholder="Search customer, address, proposal, or status" oninput="filterCards()">
  <div class="grid" id="grid">${cards || '<p>No proposals yet.</p>'}</div>
  <div class="footer">Storage: ${escapeHtml(storageInfo().storageFile)}</div></div>
  <script>
  function filterCards(){const q=search.value.toLowerCase();document.querySelectorAll('.card').forEach(card=>card.style.display=card.dataset.search.includes(q)?'':'none')}
  async function schedule(number){const value=prompt('Enter scheduled date and time, for example 2026-07-20T09:00');if(!value)return;await update(number,{action:'schedule',scheduledFor:value})}
  async function markPaid(number){const method=prompt('Payment method: Zelle or Cash','Zelle');if(!method)return;await update(number,{action:'markPaid',paymentMethod:method})}
  async function updateStatus(number,action){await update(number,{action})}
  async function update(number,payload){const r=await fetch('/api/proposals/'+encodeURIComponent(number)+'/admin-update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok){alert(d.error||'Unable to update');return}location.reload()}
  async function removeProposal(number){if(!confirm('Delete '+number+'?'))return;const r=await fetch('/api/proposals/'+encodeURIComponent(number),{method:'DELETE'});if(r.ok)location.reload();else alert('Unable to delete proposal')}
  </script></body></html>`);
});

router.get("/proposal/:proposalNumber", (req, res) => {
  res.redirect(`/api/proposals/page/${encodeURIComponent(req.params.proposalNumber)}`);
});

router.get("/receipt/:proposalNumber", (req, res) => {
  const proposal = readProposals().find(item => item.proposalNumber === req.params.proposalNumber);
  if (!proposal) return res.status(404).send("Receipt not found.");
  if (proposal.status !== "Paid") return res.status(400).send("This proposal has not been marked paid.");
  res.send(renderReceiptPage(proposal));
});

router.get("/api/proposals-export", (req, res) => {
  res.setHeader("Content-Disposition", `attachment; filename="epm-proposals-${new Date().toISOString().slice(0,10)}.json"`);
  res.json(readProposals());
});

export default router;
