import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL ?? "ABICO Loyalty <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${APP_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "ABICO Loyalty — Нууц үг сэргээх",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <div style="background:#001C3B;border-radius:16px;padding:32px;color:#fff;text-align:center">
          <div style="width:48px;height:48px;background:#1572BE;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-weight:800;font-size:20px">A</div>
          <h1 style="margin:0 0 8px;font-size:22px">Нууц үг сэргээх</h1>
          <p style="color:#93c5fd;margin:0 0 28px;font-size:15px">Та нууц үгээ мартсан тул энэ имэйл илгээгдлээ</p>
          <a href="${link}" style="display:inline-block;background:#1572BE;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px">
            Нууц үг сэргээх
          </a>
          <p style="color:#64748b;margin:24px 0 0;font-size:13px">Линк 1 цагийн дараа хүчингүй болно.<br>Та энэ имэйлийг хүлээж аваагүй бол дахин оролдоно уу.</p>
        </div>
      </div>
    `,
  });
}
