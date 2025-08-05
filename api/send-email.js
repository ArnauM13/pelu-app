const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed. Only POST requests are accepted.'
    });
  }

  try {
    const { nom, email, missatge, bookingDetails } = req.body;

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
    const businessEmail = process.env.EMAIL_TO || emailUser;

    if (!emailUser || !emailPass) {
      console.error('Missing email configuration:', {
        hasEmailUser: !!emailUser,
        hasEmailPass: !!emailPass
      });
      return res.status(500).json({
        error: 'Email service not configured'
      });
    }

    // Create transport with Gmail SMTP
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    // Determine email type and content
    const isBookingConfirmation = bookingDetails && bookingDetails.serviceName;
    const subject = isBookingConfirmation
      ? `Confirmació de reserva - ${nom}`
      : `Nova reserva de ${nom}`;

    const htmlContent = isBookingConfirmation
      ? getBookingConfirmationHTML(nom, email, missatge, bookingDetails)
      : getSimpleContactHTML(nom, email, missatge);

    const textContent = isBookingConfirmation
      ? getBookingConfirmationText(nom, email, missatge, bookingDetails)
      : getSimpleContactText(nom, email, missatge);

    // Email content - send to user's email
    const mailOptions = {
      from: emailUser,
      to: email, // Send to user's email
      subject: subject,
      html: htmlContent,
      text: textContent
    };

    // Send email to user
    const info = await transport.sendMail(mailOptions);

    // Also send a copy to the business email
    const businessMailOptions = {
      from: emailUser,
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
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Helper function to generate booking confirmation HTML
function getBookingConfirmationHTML(nom, email, missatge, bookingDetails) {
  const businessName = process.env.BUSINESS_NAME || 'El nostre negoci';

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
          Aquest correu ha estat enviat automàticament des del sistema de reserves de ${businessName}.
        </p>
      </div>
    </div>
  `;
}

// Helper function to generate simple contact HTML
function getSimpleContactHTML(nom, email, missatge) {
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
          Aquest correu ha estat enviat automàticament des del sistema de reserves.
        </p>
      </div>
    </div>
  `;
}

// Helper function to generate booking confirmation text
function getBookingConfirmationText(nom, email, missatge, bookingDetails) {
  const businessName = process.env.BUSINESS_NAME || 'El nostre negoci';

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
Aquest correu ha estat enviat automàticament des del sistema de reserves de ${businessName}.
  `;
}

// Helper function to generate simple contact text
function getSimpleContactText(nom, email, missatge) {
  return `
Nova Reserva

Detalls del client:
- Nom: ${nom}
- Email: ${email}

Missatge:
${missatge}

---
Aquest correu ha estat enviat automàticament des del sistema de reserves.
  `;
}
