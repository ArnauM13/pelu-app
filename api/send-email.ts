/* eslint-disable */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Only POST requests are accepted.' });
    return;
  }

  try {
    let body: any = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // leave as is
      }
    }

    const { to, subject, html } = body || {};

    if (!to || !subject || !html) {
      res.status(400).json({ error: 'Missing required fields: to, subject, html' });
      return;
    }

    const user = process.env['EMAIL_USER'];
    const pass = process.env['EMAIL_PASS'];

    if (!user || !pass) {
      res.status(500).json({ error: 'Email service not configured' });
      return;
    }

    const nodemailerModule = await import('nodemailer');
    const transporter = nodemailerModule.default.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: user,
      to,
      subject,
      html,
    });

    res.status(200).json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    res.status(500).json({ error: message });
  }
}


