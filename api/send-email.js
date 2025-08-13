/* eslint-disable */
import nodemailer from 'nodemailer';

function maskString(value) {
  if (!value) return null;
  if (value.length <= 4) return value[0] + '***';
  return value[0] + '***' + value.slice(-2);
}

function maskEmail(value) {
  if (!value) return null;
  const parts = String(value).split('@');
  if (parts.length !== 2) return maskString(value);
  const [local, domain] = parts;
  const maskedLocal = local.length <= 2 ? local[0] + '***' : local[0] + '***' + local.slice(-1);
  return `${maskedLocal}@${domain}`;
}

export default async function handler(req, res) {
  console.log('[email] Handler invoked', {
    method: req.method,
    url: req.url,
    vercelEnv: process.env.VERCEL_ENV || null,
  });
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed. Only POST requests are accepted.'
    });
  }

  try {
    const {
      nom,
      email,
      missatge,
      bookingDetails,
      // New snake_case fields
      email_to: emailTo,
      business_name: businessNameParam,
      // Backward compatibility (camelCase)
      businessEmail: bodyBusinessEmail,
      businessName: bodyBusinessName,
    } = req.body;

    // Verify required fields exist
    if (!nom || !email || !missatge) {
      return res.status(400).json({
        error: 'Missing required fields: nom, email, missatge'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Check if required environment variables exist
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    // Use only Vercel project configuration for copy recipient and business name
    const businessEmail = process.env.EMAIL_TO || null;
    const businessName = process.env.BUSINESS_NAME || 'PeluApp';

    // Debug logs (masked)
    console.log('[email] Runtime env info', {
      nodeEnv: process.env.NODE_ENV || null,
      vercelEnv: process.env.VERCEL_ENV || null,
      vercelUrl: process.env.VERCEL_URL || null,
      emailUserMasked: maskEmail(emailUser),
      emailToMasked: maskEmail(businessEmail),
      businessName,
      incomingOverrides: {
        email_to: typeof emailTo === 'string' ? maskEmail(emailTo) : null,
        business_name: businessNameParam || bodyBusinessName || null,
      }
    });

    if (!emailUser || !emailPass) {
      console.error('Missing email configuration:', {
        hasEmailUser: !!emailUser,
        hasEmailPass: !!emailPass
      });
      return res.status(500).json({
        error: 'Email service not configured'
      });
    }

    // Log transport configuration (masked)
    console.log('[email] Creating transport config', {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: maskEmail(emailUser),
        passMasked: maskString(emailPass),
        passLength: emailPass ? String(emailPass).length : 0,
      },
    });

    // Create transport with Gmail SMTP
    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Determine email type and content
    const isBookingConfirmation = bookingDetails && bookingDetails.serviceName;
    const subject = isBookingConfirmation
      ? `Confirmació de reserva - ${nom}`
      : `Nova reserva de ${nom}`;

    const htmlContent = isBookingConfirmation
      ? getBookingConfirmationHTML(nom, email, missatge, bookingDetails, businessName)
      : getSimpleContactHTML(nom, email, missatge, businessName);

    const textContent = isBookingConfirmation
      ? getBookingConfirmationText(nom, email, missatge, bookingDetails, businessName)
      : getSimpleContactText(nom, email, missatge, businessName);

    // Email content - primary to user's email
    const mailOptions = {
      from: `${businessName} <${emailUser}>`,
      to: email,
      subject: subject,
      html: htmlContent,
      text: textContent
    };

    console.log('[email] Sending primary email', {
      to: maskEmail(email),
      from: maskEmail(emailUser),
      subject,
      copyConfigured: !!businessEmail,
    });

    // Send email to user
    const info = await transport.sendMail(mailOptions);

    // Also send a copy to the business email from env if configured and different
    if (businessEmail && businessEmail !== email) {
      console.log('[email] Sending business copy', {
        to: maskEmail(businessEmail),
        from: maskEmail(emailUser),
        subject: `Còpia: ${subject}`
      });
      const businessMailOptions = {
        from: `${businessName} <${emailUser}>`,
        to: businessEmail,
        subject: `Còpia: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Còpia de correu enviat</h2>
            <p><strong>Enviat a:</strong> ${email}</p>
            <p><strong>Nom del client:</strong> ${nom}</p>
            <hr style="margin: 20px 0;">
            ${htmlContent}
          </div>
        `,
        text: `
Còpia de correu enviat
Enviat a: ${email}
Nom del client: ${nom}

${textContent}
        `
      };

      await transport.sendMail(businessMailOptions);
    }

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      clientName: nom,
      clientEmail: email,
      businessEmail: businessEmail,
      type: isBookingConfirmation ? 'booking_confirmation' : 'contact'
    });

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending email:', error);

    return res.status(500).json({
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

// Helper function to generate booking confirmation HTML
function getBookingConfirmationHTML(nom, email, missatge, bookingDetails, businessName) {
  const resolvedName = businessName || process.env.BUSINESS_NAME || 'PeluApp';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Confirmació de Reserva</h2>

      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #555; margin-top: 0;">Detalls del client:</h3>
        <p><strong>Nom:</strong> ${nom}</p>
        <p><strong>Email:</strong> ${email}</p>
      </div>

      <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #555; margin-top: 0;">Detalls de la reserva:</h3>
        <p><strong>Servei:</strong> ${bookingDetails.serviceName || 'No especificat'}</p>
        <p><strong>Data:</strong> ${bookingDetails.date || 'No especificada'}</p>
        <p><strong>Hora:</strong> ${bookingDetails.time || 'No especificada'}</p>
        <p><strong>Preu:</strong> ${bookingDetails.price ? `${bookingDetails.price}€` : 'No especificat'}</p>
      </div>

      <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #555; margin-top: 0;">Missatge:</h3>
        <p style="white-space: pre-wrap;">${missatge}</p>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">
          Aquest correu ha estat enviat automàticament des del sistema de reserves de ${resolvedName}.
        </p>
      </div>
    </div>
  `;
}

// Helper function to generate simple contact HTML
function getSimpleContactHTML(nom, email, missatge, businessName) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Nova Reserva</h2>

      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #555; margin-top: 0;">Detalls del client:</h3>
        <p><strong>Nom:</strong> ${nom}</p>
        <p><strong>Email:</strong> ${email}</p>
      </div>

      <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #555; margin-top: 0;">Missatge:</h3>
        <p style="white-space: pre-wrap;">${missatge}</p>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">
          Aquest correu ha estat enviat automàticament des del sistema de reserves de ${businessName || process.env.BUSINESS_NAME || 'El nostre negoci'}.
        </p>
      </div>
    </div>
  `;
}

// Helper function to generate booking confirmation text
function getBookingConfirmationText(nom, email, missatge, bookingDetails, businessName) {
  const resolvedName = businessName || process.env.BUSINESS_NAME || 'PeluApp';

  return `
Confirmació de Reserva

Detalls del client:
- Nom: ${nom}
- Email: ${email}

Detalls de la reserva:
- Servei: ${bookingDetails.serviceName || 'No especificat'}
- Data: ${bookingDetails.date || 'No especificada'}
- Hora: ${bookingDetails.time || 'No especificada'}
- Preu: ${bookingDetails.price ? `${bookingDetails.price}€` : 'No especificat'}

Missatge:
${missatge}

---
 Aquest correu ha estat enviat automàticament des del sistema de reserves de ${resolvedName}.
  `;
}

// Helper function to generate simple contact text
function getSimpleContactText(nom, email, missatge, businessName) {
  return `
Nova Reserva

Detalls del client:
- Nom: ${nom}
- Email: ${email}

Missatge:
${missatge}

 ---
 Aquest correu ha estat enviat automàticament des del sistema de reserves de ${businessName || process.env.BUSINESS_NAME || 'El nostre negoci'}.
  `;
}
