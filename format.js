
import crypto from "node:crypto";

export function money(value) {
  return `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function publicBaseUrl(req) {
  return process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
}

export function newId(prefix = "") {
  return `${prefix}${crypto.randomUUID()}`;
}

export function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("en-US");
}
