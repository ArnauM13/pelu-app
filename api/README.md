# Email API

This directory contains Vercel Serverless Functions for sending emails.

## Files

- `send-email.js` - Main email sending function
- `test-email.js` - Test endpoint to verify configuration
- `README.md` - This documentation

## Email Flow

The API sends emails in the following way:

1. **Primary Email**: Sent to the user's email address (the `email` field in the request)
2. **Copy Email**: Sent to the business email address (`EMAIL_TO` environment variable)

This ensures that:
- The user receives their booking confirmation directly
- The business receives a copy for their records
- Both emails contain the same information

## Setup

### 1. Environment Variables

You need to set up the following environment variables in your Vercel project:

```bash
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=business@example.com  # Business email to receive copies
BUSINESS_NAME=El teu negoci      # Optional, defaults to "El nostre negoci"
```

### 2. Gmail App Password

To use Gmail SMTP, you need to:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use this app password as `EMAIL_PASS`

### 3. Vercel Deployment

The API functions will be automatically deployed when you push to Vercel.

### 4. Local Development

For local development, you can use Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Set environment variables locally
vercel env add EMAIL_USER
vercel env add EMAIL_PASS
vercel env add EMAIL_TO

# Start development server
vercel dev
```

## Usage

### Send Email

```javascript
const response = await fetch('/api/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nom: 'Client Name',
    email: 'client@example.com',  // This is where the email will be sent
    missatge: 'Email message content'
  }),
});

const result = await response.json();
```

### Send Booking Confirmation Email

```javascript
const response = await fetch('/api/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nom: 'Client Name',
    email: 'client@example.com',  // This is where the confirmation will be sent
    missatge: 'Thank you for your booking!',
    bookingDetails: {
      serviceName: 'Haircut + Wash',
      date: '2024-01-15',
      time: '14:30',
      price: 25.00
    }
  }),
});

const result = await response.json();
```

### Test Configuration

```javascript
const response = await fetch('/api/test-email');
const result = await response.json();
```

## API Endpoints

### POST /api/send-email

Sends an email using the configured Gmail SMTP.

**Email Flow:**
- Primary email sent to the `email` field in the request
- Copy sent to the business email (`EMAIL_TO` environment variable)

**Request Body:**
```json
{
  "nom": "string",
  "email": "string",  // Recipient email address
  "missatge": "string",
  "bookingDetails": {
    "serviceName": "string",
    "date": "string",
    "time": "string",
    "price": "number"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "message-id"
}
```

### GET /api/test-email

Tests the email configuration.

**Response:**
```json
{
  "message": "Email API is configured",
  "configured": {
    "hasEmailUser": true,
    "hasEmailPass": true,
    "hasEmailTo": true,
    "emailTo": "recipient@example.com"
  }
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `400` - Bad request (missing fields, invalid email)
- `405` - Method not allowed
- `500` - Server error (configuration issues, email sending failed)

## Email Templates

The API supports two types of email templates:

1. **Simple Contact Email**: Basic contact form emails
2. **Booking Confirmation Email**: Detailed booking confirmation with service details

The template is automatically selected based on whether `bookingDetails` is provided.

## Integration with Angular Service

The `EmailService` in the Angular app automatically uses this API when sending booking confirmation emails.

## Testing

You can test the API using the provided test script:

```bash
node test-email-api.js
```

This will test both simple contact emails and booking confirmation emails.

## Troubleshooting

### Common Issues

1. **"Email service not configured"**: Check that `EMAIL_USER` and `EMAIL_PASS` are set
2. **"Invalid email format"**: Ensure the email address is properly formatted
3. **"Authentication failed"**: Verify your Gmail app password is correct
4. **"Network error"**: Check your internet connection and API endpoint

### Debug Mode

Set `NODE_ENV=development` to get more detailed error messages in the API responses. 
