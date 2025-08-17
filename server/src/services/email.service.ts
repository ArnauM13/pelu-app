import nodemailer from 'nodemailer';

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

if (!user || !pass) {
  // eslint-disable-next-line no-console
  console.warn('EMAIL_USER or EMAIL_PASS not set; sendEmail will fail');
}

export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  await transporter.sendMail({ from: user, to, subject, text });
  return true;
}




