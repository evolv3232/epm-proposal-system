
import express from "express";
import { prependProposal, readProposals, updateProposal, deleteProposal } from "./storage.js";
import { newId, publicBaseUrl } from "./format.js";
import { renderProposalPage } from "./proposalPage.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, version: "2.0.0", proposalRoutesReady: true });
});

router.post("/", (req, res) => {
  try {
    const body = req.body || {};
    const lineItems = Array.isArray(body.lineItems)
      ? body.lineItems.map(item => ({
          service: String(item.service || "").trim(),
          description: String(item.description || "").trim(),
          amount: Number(item.amount || 0)
        })).filter(item => item.service && item.amount >= 0)
      : [];

    if (!body.customerName || !body.propertyAddress || !lineItems.length) {
      return res.status(400).json({ error: "Customer name, property address, and at least one service are required." });
    }

    const proposals = readProposals();
    const proposalNumber = String(body.proposalNumber || "").trim() ||
      `EPM-${new Date().getFullYear()}-${String(proposals.length + 1).padStart(4, "0")}`;

    if (proposals.some(item => item.proposalNumber === proposalNumber)) {
      return res.status(409).json({ error: "That proposal number already exists." });
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const proposal = {
      id: newId("proposal_"),
      proposalNumber,
      customer: {
        name: String(body.customerName || "").trim(),
        phone: String(body.customerPhone || "").trim(),
        email: String(body.customerEmail || "").trim()
      },
      propertyAddress: String(body.propertyAddress || "").trim(),
      preparedDate: String(body.preparedDate || "").trim() || new Date().toISOString().slice(0, 10),
      notes: String(body.notes || "").trim(),
      lineItems,
      subtotal,
      total: subtotal,
      status: "Sent — Awaiting Approval",
      paymentTerms: "Payment due immediately after completion",
      paymentMethod: null,
      paymentReportedAt: null,
      paidAt: null,
      approvedAt: null,
      signatureName: null,
      scheduledFor: null,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    prependProposal(proposal);
    const url = `${publicBaseUrl(req)}/proposal/${encodeURIComponent(proposal.proposalNumber)}`;
    res.json({ ok: true, proposal, url });
  } catch (error) {
    console.error("Create proposal error:", error);
    res.status(500).json({ error: "Unable to create proposal." });
  }
});

router.get("/page/:proposalNumber", (req, res) => {
  const proposal = readProposals().find(item => item.proposalNumber === req.params.proposalNumber);
  if (!proposal) return res.status(404).send("Proposal not found.");
  res.send(renderProposalPage(proposal));
});

router.get("/:proposalNumber", (req, res) => {
  const proposal = readProposals().find(item => item.proposalNumber === req.params.proposalNumber);
  if (!proposal) return res.status(404).json({ error: "Proposal not found." });
  res.json({ ok: true, proposal });
});

router.post("/:proposalNumber/approve", (req, res) => {
  const signatureName = String(req.body?.signatureName || "").trim();
  if (!signatureName || !req.body?.acceptedAllTerms) {
    return res.status(400).json({ error: "Signature and acceptance of all terms are required." });
  }
  const updated = updateProposal(req.params.proposalNumber, proposal => ({
    ...proposal,
    status: "Approved — Awaiting Scheduling",
    signatureName,
    approvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
  if (!updated) return res.status(404).json({ error: "Proposal not found." });
  res.json({ ok: true, proposal: updated });
});

router.post("/:proposalNumber/payment-report", (req, res) => {
  const method = String(req.body?.method || "").trim();
  if (!["Zelle", "Cash"].includes(method)) {
    return res.status(400).json({ error: "Invalid payment method." });
  }
  const updated = updateProposal(req.params.proposalNumber, proposal => ({
    ...proposal,
    paymentMethod: method,
    paymentReportedAt: new Date().toISOString(),
    status: method === "Zelle"
      ? "Payment Reported — Awaiting EPM Confirmation"
      : "Cash Selected — Due After Completion",
    updatedAt: new Date().toISOString()
  }));
  if (!updated) return res.status(404).json({ error: "Proposal not found." });
  res.json({ ok: true, proposal: updated });
});

router.post("/:proposalNumber/admin-update", (req, res) => {
  const action = String(req.body?.action || "");
  const scheduledFor = req.body?.scheduledFor || null;
  const paymentMethod = req.body?.paymentMethod || null;

  const updated = updateProposal(req.params.proposalNumber, proposal => {
    const now = new Date().toISOString();
    if (action === "schedule") {
      return { ...proposal, scheduledFor, status: "Scheduled", updatedAt: now };
    }
    if (action === "complete") {
      return { ...proposal, completedAt: now, status: "Completed — Payment Due", updatedAt: now };
    }
    if (action === "markPaid") {
      return { ...proposal, paymentMethod: paymentMethod || proposal.paymentMethod || "Other", paidAt: now, status: "Paid", updatedAt: now };
    }
    if (action === "reopen") {
      return { ...proposal, status: "Sent — Awaiting Approval", updatedAt: now };
    }
    return proposal;
  });

  if (!updated) return res.status(404).json({ error: "Proposal not found." });
  res.json({ ok: true, proposal: updated });
});

router.delete("/:proposalNumber", (req, res) => {
  const deleted = deleteProposal(req.params.proposalNumber);
  if (!deleted) return res.status(404).json({ error: "Proposal not found." });
  res.json({ ok: true });
});

export default router;
