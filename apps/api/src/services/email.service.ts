import nodemailer from "nodemailer";
import env from "../config/env";
import { renderTemplate } from "../utils/emailTemplates";

let etherealAccount: nodemailer.TestAccount | null = null;

/**
 * Get Nodemailer transporter
 * - Dev: Ethereal (test inbox + preview URL)
 * - Prod: Brevo/Mailgun SMTP (env üzerinden)
 */
async function getTransporter() {
  if (process.env.NODE_ENV !== "production") {
    if (!etherealAccount) {
      etherealAccount = await nodemailer.createTestAccount();
    }
    return nodemailer.createTransport({
      host: etherealAccount.smtp.host,
      port: etherealAccount.smtp.port,
      secure: etherealAccount.smtp.secure,
      auth: {
        user: etherealAccount.user,
        pass: etherealAccount.pass,
      },
    });
  } else {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: false,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
}

/**
 * Generic send mail function
 */
export async function sendMail(
  to: string,
  subject: string,
  template: string,
  variables: Record<string, any>
) {
  const html = renderTemplate(template, variables);
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from:
      process.env.NODE_ENV !== "production" && etherealAccount
        ? etherealAccount.user
        : env.SMTP_FROM,
    to,
    subject,
    html,
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
}

/**
 * OTP Email
 */
export async function sendOtpEmail(email: string, code: string) {
  return sendMail(email, "Authix Giriş Kodu", "otp", {
    code,
    year: new Date().getFullYear(),
  });
}

/**
 * Password Reset Email
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  return sendMail(email, "Şifre Sıfırlama", "passwordReset", { token });
}