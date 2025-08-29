import nodemailer from "nodemailer";
import env from "../config/env";

function getTransport() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    // Dev fallback: disabled SMTP (we'll just log)
    return null;
  }
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

export async function sendOtpEmail(to: string, code: string) {
  const transport = getTransport();
  if (!transport) {
    console.log(`[DEV][OTP] ${to} → code: ${code}`);
    return;
  }
  await transport.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: "Your Authix verification code",
    text: `Your code is ${code}. It expires in ${env.OTP_TTL_MINUTES} minutes.`,
  });
}

export async function sendPasswordResetEmail(to: string, linkOrToken: string) {
  const transport = getTransport();
  if (!transport) {
    console.log(`[DEV][PWD-RESET] ${to} → token: ${linkOrToken}`);
    return;
  }
  await transport.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: "Reset your password",
    text: `Use this token to set your password: ${linkOrToken}`,
  });
}