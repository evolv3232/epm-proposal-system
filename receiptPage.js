
import { escapeHtml, money, formatDateTime } from "./format.js";

export function renderReceiptPage(proposal) {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Receipt ${escapeHtml(proposal.proposalNumber)}</title>
  <style>body{font-family:Arial;background:#f4f7f3;padding:20px;color:#061b33}.receipt{max-width:700px;margin:auto;background:white;padding:28px;border-radius:16px}.row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #ddd}.total{font-size:22px;font-weight:bold}.paid{color:#166534;font-weight:bold}</style>
  </head><body><div class="receipt"><h1>Exterior Property Maintenance</h1><p class="paid">PAID RECEIPT</p>
  <p><strong>Receipt for:</strong> ${escapeHtml(proposal.proposalNumber)}</p>
  <p><strong>Customer:</strong> ${escapeHtml(proposal.customer.name)}</p>
  <p><strong>Property:</strong> ${escapeHtml(proposal.propertyAddress)}</p>
  ${proposal.lineItems.map(i=>`<div class="row"><span>${escapeHtml(i.service)}</span><strong>${money(i.amount)}</strong></div>`).join("")}
  <div class="row total"><span>Total Paid</span><strong>${money(proposal.total)}</strong></div>
  <p><strong>Payment Method:</strong> ${escapeHtml(proposal.paymentMethod || "Recorded by EPM")}</p>
  <p><strong>Paid Date:</strong> ${escapeHtml(formatDateTime(proposal.paidAt))}</p>
  <p>Thank you for choosing Exterior Property Maintenance.</p></div></body></html>`;
}
