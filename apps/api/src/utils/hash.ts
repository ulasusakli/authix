import bcrypt from "bcryptjs";

export function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export function comparePassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}