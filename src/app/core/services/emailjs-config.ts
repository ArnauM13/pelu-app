// EmailJS Configuration
// You need to set up EmailJS at https://www.emailjs.com/
// 1. Create an account
// 2. Add an email service (Gmail, Outlook, etc.)
// 3. Create an email template
// 4. Get your public key

export const EMAILJS_CONFIG = {
  // Real EmailJS credentials
  SERVICE_ID: 'service_bijtgye', // Your EmailJS service ID
  TEMPLATE_ID: 'template_53nzok7', // Your EmailJS template ID
  PUBLIC_KEY: '8cd3oe_pD3g59E52b', // Your EmailJS public key
};

// EmailJS Template Variables
// Based on the user's template format:
export const EMAILJS_TEMPLATE_VARIABLES = {
  order_id: '{{order_id}}', // booking_id
  image_url: '{{image_url}}', // assets/images/peluapp-dark-thick.svg
  name: '{{name}}', // client_name
  price: '{{price}}', // service_price
  cost: '{{cost}}', // service_cost
  email: '{{email}}', // user_email
};

// Instructions for setting up EmailJS:
// 1. Go to https://www.emailjs.com/ and create an account
// 2. Add an email service (Gmail, Outlook, etc.)
// 3. Create an email template with the variables above
// 4. Get your credentials and replace the values in EMAILJS_CONFIG
// 5. Update the HybridEmailService with your actual credentials

// IMPORTANT: Replace YOUR_PUBLIC_KEY with your actual EmailJS public key
// You can find it in your EmailJS dashboard under Account > API Keys
