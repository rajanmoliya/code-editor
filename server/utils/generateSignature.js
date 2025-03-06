import crypto from "crypto";

export default function generateSignature(webhookBody, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(webhookBody))
    .digest("hex");
}
