import dotenv from "dotenv";
dotenv.config();

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`❌ Missing env: ${name}`);
  return v;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5001,

  DATABASE_URL: req("DATABASE_URL"),

  JWT_ACCESS_SECRET: req("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: req("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  OTP_CODE_LENGTH: Number(process.env.OTP_CODE_LENGTH || 6),
  OTP_TTL_MINUTES: Number(process.env.OTP_TTL_MINUTES || 5),
  PASSWORD_RESET_TTL_MINUTES: Number(process.env.PASSWORD_RESET_TTL_MINUTES || 60),

  EMAIL_FROM: process.env.EMAIL_FROM || "Authix <no-reply@authix.dev>",
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
};

export default env;