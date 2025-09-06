import { sendOtpEmail, sendPasswordResetEmail } from "./email.service";

export type NotificationType = "otp" | "passwordReset";

export async function notifyEmail(
  type: NotificationType,
  email: string,
  payload: Record<string, any>
) {
  switch (type) {
    case "otp":
      return sendOtpEmail(email, payload.code);
    case "passwordReset":
      return sendPasswordResetEmail(email, payload.token);
    default:
      throw new Error(`Unknown email notification type: ${type}`);
  }
}