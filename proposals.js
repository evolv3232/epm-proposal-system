
import express from "express";
import {
  prependProposal,
  readProposals,
  updateProposal
} from "./storage.js";
import {
  money,
  newId,
  publicBaseUrl
} from "./format.js";
import { renderProposalPage } from "./proposalPage.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    version: "1.0.1",
    proposalRoutesReady: true
  });
});

router.post("/", (req, res) => {
  try {
    const body = req.body || {};

    const lineItems = Array.isArray(body.lineItems)
      ? body.lineItems
          .map(item => ({
            service: String(item.service || "").trim(),
            description: String(item.description || "").trim(),
            amount: Number(item.amount || 0)
          }))
          .filter(item => item.service && item.amount >= 0)
      : [];

    if (!body.customerName || !body.propertyAddress || !lineItems.length) {
      return res.status(400).json({
        error: "Customer name, property address, and at least one service are required."
      });
    }

    const proposals = readProposals();

    const proposalNumber =
      String(body.proposalNumber || "").trim() ||
      `EPM-${new Date().getFullYear()}-${String(proposals.length + 1).padStart(4, "0")}`;

    if (proposals.some(proposal => proposal.proposalNumber === proposalNumber)) {
      return res.status(409).json({
        error: "That proposal number already exists."
      });
    }

    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const proposal = {
      id: newId("proposal_"),
      proposalNumber,
      customer: {
        name: String(body.customerName || "").trim(),
        phone: String(body.customerPhone || "").trim(),
        email: String(body.customerEmail || "").trim()
      },
      propertyAddress: String(body.propertyAddress || "").trim(),
      preparedDate:
        String(body.preparedDate || "").trim() ||
        new Date().toISOString().slice(0, 10),
      notes: String(body.notes || "").trim(),
      lineItems,
      subtotal,
      total: subtotal,
      status: "Sent — Awaiting Approval",
      paymentTerms: "Payment due immediately after completion",
      paymentMethod: null,
      paymentReportedAt: null,
      approvedAt: null,
      signatureName: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    prependProposal(proposal);

    const url = `${publicBaseUrl(req)}/proposal/${encodeURIComponent(proposal.proposalNumber)}`;

    res.json({
      ok: true,
      proposal,
      url
    });
  } catch (error) {
    console.error("Create proposal error:", error);
    res.status(500).json({
      error: "Unable to create proposal."
    });
  }
});

router.get("/:proposalNumber", (req, res) => {
  const proposal = readProposals().find(
    item => item.proposalNumber === req.params.proposalNumber
  );

  if (!proposal) {
    return res.status(404).json({
      error: "Proposal not found."
    });
  }

  res.json({
    ok: true,
    proposal
  });
});

router.post("/:proposalNumber/approve", (req, res) => {
  const signatureName = String(req.body?.signatureName || "").trim();
  const acceptedAllTerms = Boolean(req.body?.acceptedAllTerms);

  if (!signatureName || !acceptedAllTerms) {
    return res.status(400).json({
      error: "Signature and acceptance of all terms are required."
    });
  }

  const updated = updateProposal(
    req.params.proposalNumber,
    proposal => ({
      ...proposal,
      status: "Approved — Payment Due After Completion",
      signatureName,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  );

  if (!updated) {
    return res.status(404).json({
      error: "Proposal not found."
    });
  }

  res.json({
    ok: true,
    proposal: updated
  });
});

router.post("/:proposalNumber/payment-report", (req, res) => {
  const method = String(req.body?.method || "").trim();

  if (!["Zelle", "Cash"].includes(method)) {
    return res.status(400).json({
      error: "Invalid payment method."
    });
  }

  const updated = updateProposal(
    req.params.proposalNumber,
    proposal => ({
      ...proposal,
      paymentMethod: method,
      paymentReportedAt: new Date().toISOString(),
      status:
        method === "Zelle"
          ? "Payment Reported — Awaiting EPM Confirmation"
          : "Cash Selected — Due After Completion",
      updatedAt: new Date().toISOString()
    })
  );

  if (!updated) {
    return res.status(404).json({
      error: "Proposal not found."
    });
  }

  res.json({
    ok: true,
    proposal: updated
  });
});

router.get("/page/:proposalNumber", (req, res) => {
  const proposal = readProposals().find(
    item => item.proposalNumber === req.params.proposalNumber
  );

  if (!proposal) {
    return res.status(404).send("Proposal not found.");
  }

  res.send(renderProposalPage(proposal));
});

export default router;
