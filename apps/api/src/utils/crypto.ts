import crypto from "crypto";

export function generateNumericCode(length = 6) {
  const max = 10 ** length;
  return (crypto.randomInt(0, max) + "").padStart(length, "0");
}

export function randomUsername() {
  const s = crypto.randomBytes(4).toString("hex");
  return `user_${s}`;
}