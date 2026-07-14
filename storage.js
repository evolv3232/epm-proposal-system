
import fs from "node:fs";
import path from "node:path";

const STORAGE_FILE = process.env.PROPOSALS_FILE || path.resolve("proposals.json");

function ensureFile() {
  if (!fs.existsSync(STORAGE_FILE)) {
    fs.writeFileSync(STORAGE_FILE, "[]", "utf8");
  }
}

export function readProposals() {
  ensureFile();

  try {
    const parsed = JSON.parse(fs.readFileSync(STORAGE_FILE, "utf8") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Unable to read proposals:", error);
    return [];
  }
}

export function writeProposals(proposals) {
  ensureFile();
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(proposals, null, 2), "utf8");
}

export function prependProposal(proposal) {
  const proposals = readProposals();
  proposals.unshift(proposal);
  writeProposals(proposals);
  return proposal;
}

export function updateProposal(proposalNumber, updater) {
  const proposals = readProposals();
  const index = proposals.findIndex(
    proposal => proposal.proposalNumber === proposalNumber
  );

  if (index < 0) return null;

  proposals[index] = updater(proposals[index]);
  writeProposals(proposals);
  return proposals[index];
}
