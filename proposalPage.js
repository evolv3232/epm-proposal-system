
import { escapeHtml, money, formatDateTime } from "./format.js";

function paymentPanel(proposal) {
  const paid = proposal.status === "Paid";
  if (paid) {
    return `<div class="paid-box"><strong>Paid in full</strong><br>
      Payment method: ${escapeHtml(proposal.paymentMethod || "Recorded by EPM")}<br>
      Paid: ${escapeHtml(formatDateTime(proposal.paidAt))}<br>
      <a class="btn dark" href="/receipt/${encodeURIComponent(proposal.proposalNumber)}" target="_blank">View Receipt</a>
    </div>`;
  }

  return `
    <p>Payment is due immediately after the approved work is completed.</p>
    <div class="pay">
      <h3>Zelle</h3>
      <p><strong>823-396-4885</strong><br>Recipient: <strong>Andy Martinez</strong></p>
      <p class="warning">Confirm your banking app displays Andy Martinez before sending.</p>
      <div class="actions">
        <button class="secondary" onclick="copyZelle()">Copy Number</button>
        <button class="primary" onclick="reportPayment('Zelle')">I've Sent Payment</button>
      </div>
    </div>
    <div class="pay">
      <h3>Cash</h3>
      <p>Pay the EPM technician after completion. A receipt will be provided.</p>
      <button class="secondary" onclick="reportPayment('Cash')">I Plan to Pay Cash</button>
    </div>
    <div class="msg" id="paymentMessage"></div>`;
}

export function renderProposalPage(proposal) {
  const rows = proposal.lineItems.map(item => `
    <tr>
      <td><strong>${escapeHtml(item.service)}</strong></td>
      <td>${escapeHtml(item.description)}</td>
      <td class="amount">${money(item.amount)}</td>
    </tr>`).join("");

  const agreementItems = [
    "I confirm that I own the property or am authorized to approve the work.",
    "I authorize EPM to perform only the services listed in this proposal.",
    "Additional billable work requires my approval.",
    "Payment is due immediately after completion unless otherwise agreed in writing.",
    "Weather, unsafe conditions, or equipment issues may require rescheduling.",
    "I will secure pets and move vehicles or belongings when practical.",
    "I authorize before-and-after photos for service documentation.",
    "I will report concerns within 48 hours so EPM can address them."
  ].map(item => `<label><input class="term" type="checkbox"><span>${escapeHtml(item)}</span></label>`).join("");

  const approvedBlock = proposal.approvedAt
    ? `<div class="approved-box"><strong>Approved by ${escapeHtml(proposal.signatureName || proposal.customer.name)}</strong><br>${escapeHtml(formatDateTime(proposal.approvedAt))}</div>`
    : `<div class="terms">${agreementItems}</div>
       <p><strong>Electronic signature</strong></p>
       <input id="signature" type="text" placeholder="Type full name">
       <div class="actions">
         <button class="primary" onclick="approveProposal()">Approve Estimate</button>
         <a class="btn secondary" href="sms:2818148804?body=${encodeURIComponent(`Hi EPM, I would like changes to ${proposal.proposalNumber}.`)}">Request Changes</a>
         <a class="btn dark" href="tel:2818148804">Call EPM</a>
       </div>
       <div class="msg" id="approvalMessage"></div>`;

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(proposal.proposalNumber)} | EPM</title>
<style>
:root{--navy:#061b33;--green:#2f7d20;--border:#d7e4d2;--muted:#64748b}
*{box-sizing:border-box}body{margin:0;padding:14px;font-family:Arial;background:#f4f7f3;color:var(--navy)}
.wrap{max-width:880px;margin:auto;background:white;border-radius:18px;overflow:hidden;border:1px solid var(--border)}
header{background:linear-gradient(135deg,#061b33,#123a63);color:white;padding:24px}header h1{margin:0 0 8px}
main{padding:18px}.panel{margin-top:14px;padding:17px;border:1px solid var(--border);border-radius:14px}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:9px}.meta div{background:#f8fafc;padding:10px;border-radius:9px}
.meta span{display:block;color:var(--muted);font-size:11px}.status{display:inline-block;padding:7px 10px;background:#fff3cd;color:#7a5700;border-radius:999px;font-weight:bold;font-size:12px}
table{width:100%;border-collapse:collapse}th,td{padding:10px;border-bottom:1px solid #e2e8f0;text-align:left;font-size:13px}.amount{text-align:right;white-space:nowrap}
.totals{max-width:360px;margin:12px 0 0 auto}.row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #ddd}.grand{font-size:20px;font-weight:bold;border-top:2px solid var(--green)}
.terms{display:grid;gap:8px}.terms label{display:flex;gap:8px;padding:9px;border:1px solid #ddd;border-radius:9px;font-size:13px}
input[type=text]{width:100%;padding:12px;border:1px solid #bbb;border-radius:9px}
button,a.btn{display:inline-flex;justify-content:center;align-items:center;padding:12px 16px;border:0;border-radius:10px;font-weight:bold;text-decoration:none;cursor:pointer}
.primary{background:var(--green);color:white}.secondary{background:#e9eef3;color:var(--navy)}.dark{background:var(--navy);color:white}
.actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:13px}.msg{display:none;margin-top:10px;padding:12px;background:#eef7eb;color:#166534;border-radius:10px}
.pay{padding:13px;border:1px solid var(--border);border-radius:11px;margin-top:10px;background:#fbfdfb}.warning{color:#6b4c00}
.approved-box,.paid-box{padding:14px;border-radius:11px;background:#eef7eb;color:#166534}
@media(max-width:650px){.meta{grid-template-columns:1fr}.actions{display:grid}.actions>*{width:100%}}
</style></head>
<body><div class="wrap">
<header><div style="color:#a7d39f;font-size:12px;font-weight:bold;letter-spacing:.12em">EXTERIOR PROPERTY MAINTENANCE</div>
<h1>Proposal & Service Agreement</h1><p>Review and approve the work. Payment is due after completion.</p></header>
<main>
<div class="status" id="status">${escapeHtml(proposal.status)}</div>
<section class="panel"><h2>Proposal Details</h2><div class="meta">
<div><span>Proposal</span><strong>${escapeHtml(proposal.proposalNumber)}</strong></div>
<div><span>Customer</span><strong>${escapeHtml(proposal.customer.name)}</strong></div>
<div><span>Property</span><strong>${escapeHtml(proposal.propertyAddress)}</strong></div>
<div><span>Prepared Date</span><strong>${escapeHtml(proposal.preparedDate)}</strong></div>
${proposal.scheduledFor ? `<div><span>Scheduled For</span><strong>${escapeHtml(formatDateTime(proposal.scheduledFor))}</strong></div>` : ""}
</div></section>
<section class="panel"><h2>Itemized Services</h2><table><thead><tr><th>Service</th><th>Description</th><th class="amount">Amount</th></tr></thead>
<tbody>${rows}</tbody></table><div class="totals"><div class="row"><span>Subtotal</span><strong>${money(proposal.subtotal)}</strong></div><div class="row grand"><span>Total</span><strong>${money(proposal.total)}</strong></div></div>
<p style="color:#64748b;font-size:13px">${escapeHtml(proposal.notes)}</p></section>
<section class="panel"><h2>Service Agreement</h2>${approvedBlock}</section>
<section class="panel"><h2>Payment</h2>${paymentPanel(proposal)}</section>
</main></div>
<script>
const proposalNumber=${JSON.stringify(proposal.proposalNumber)};
async function approveProposal(){
 const all=[...document.querySelectorAll('.term')].every(input=>input.checked);
 const signature=document.getElementById('signature').value.trim();
 const message=document.getElementById('approvalMessage');
 if(!all||!signature){message.style.display='block';message.textContent='Accept all terms and type your full name.';return;}
 const response=await fetch('/api/proposals/'+encodeURIComponent(proposalNumber)+'/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({signatureName:signature,acceptedAllTerms:true})});
 const data=await response.json();message.style.display='block';message.textContent=response.ok?'Proposal approved. EPM will contact you to schedule service.':(data.error||'Unable to save approval.');
 if(response.ok){document.getElementById('status').textContent=data.proposal.status;setTimeout(()=>location.reload(),800);}
}
async function reportPayment(method){
 const response=await fetch('/api/proposals/'+encodeURIComponent(proposalNumber)+'/payment-report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({method})});
 const data=await response.json();const message=document.getElementById('paymentMessage');message.style.display='block';
 message.textContent=response.ok?(method==='Zelle'?'Payment reported. EPM will verify receipt.':'Cash selected. Pay after service and receive a receipt.'):(data.error||'Unable to save selection.');
 if(response.ok)document.getElementById('status').textContent=data.proposal.status;
}
async function copyZelle(){try{await navigator.clipboard.writeText('8233964885')}catch(error){}const message=document.getElementById('paymentMessage');message.style.display='block';message.textContent='Zelle number copied.'}
</script></body></html>`;
}
