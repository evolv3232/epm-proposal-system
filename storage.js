
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = process.env.DATA_DIR || process.cwd();
const STORAGE_FILE = process.env.PROPOSALS_FILE || path.join(DATA_DIR, "proposals.json");

function ensureStorage() {
  fs.mkdirSync(path.dirname(STORAGE_FILE), { recursive: true });
  if (!fs.existsSync(STORAGE_FILE)) {
    fs.writeFileSync(STORAGE_FILE, "[]", "utf8");
  }
}

export function readProposals() {
  ensureStorage();
  try {
    const parsed = JSON.parse(fs.readFileSync(STORAGE_FILE, "utf8") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Unable to read proposals:", error);
    return [];
  }
}

export function writeProposals(proposals) {
  ensureStorage();
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
  const index = proposals.findIndex(item => item.proposalNumber === proposalNumber);
  if (index < 0) return null;
  proposals[index] = updater(proposals[index]);
  writeProposals(proposals);
  return proposals[index];
}

export function deleteProposal(proposalNumber) {
  const proposals = readProposals();
  const next = proposals.filter(item => item.proposalNumber !== proposalNumber);
  if (next.length === proposals.length) return false;
  writeProposals(next);
  return true;
}

export function storageInfo() {
  return { dataDir: DATA_DIR, storageFile: STORAGE_FILE };
}
