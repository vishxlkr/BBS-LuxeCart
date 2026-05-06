import transporter from '../config/email';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await transporter.sendMail({
        from: `"LuxeCart" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log(`✉️ Email sent to ${options.to}`);
      return;
    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ Email send attempt ${attempt} failed:`, (error as Error).message);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw new Error(`Failed to send email after ${maxRetries} attempts: ${lastError?.message}`);
};

export const otpEmailTemplate = (otp: string, type: 'signup' | 'reset-password'): string => {
  const action = type === 'signup' ? 'verify your account' : 'reset your password';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>LuxeCart OTP</title>
    </head>
    <body style="margin:0;padding:0;background-color:#1A1A2E;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1A1A2E;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#16213E;border-radius:12px;border:1px solid #2A2A4A;overflow:hidden;max-width:600px;">
              <tr>
                <td style="padding:32px;text-align:center;border-bottom:1px solid #2A2A4A;">
                  <h1 style="color:#B8860B;font-size:28px;margin:0;letter-spacing:3px;font-weight:700;">LUXECART</h1>
                  <p style="color:#888888;font-size:13px;margin:4px 0 0;">Premium E-Commerce Platform</p>
                </td>
              </tr>
              <tr>
                <td style="padding:40px 32px;">
                  <h2 style="color:#FFFFFF;font-size:22px;margin:0 0 16px;font-weight:600;">Your Verification Code</h2>
                  <p style="color:#CCCCCC;font-size:15px;margin:0 0 32px;line-height:1.6;">
                    Use the code below to ${action}. This code expires in <strong style="color:#B8860B;">5 minutes</strong>.
                  </p>
                  <div style="background:#1A1A2E;border:2px solid #B8860B;border-radius:8px;padding:24px;text-align:center;margin:0 0 32px;">
                    <span style="font-size:42px;font-weight:700;letter-spacing:12px;color:#B8860B;font-family:'Courier New',monospace;">${otp}</span>
                  </div>
                  <p style="color:#888888;font-size:13px;margin:0;line-height:1.6;">
                    If you didn't request this, please ignore this email. Do not share this code with anyone.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 32px;background:#0F0F1A;text-align:center;">
                  <p style="color:#888888;font-size:12px;margin:0;">© ${new Date().getFullYear()} LuxeCart. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
