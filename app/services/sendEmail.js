import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send email using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @returns {Promise} Promise resolving to email result
 */
export default async function sendEmail({ to, subject, html, text }) {
  try {
    console.log(`📧 Sending email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    
    const mailOptions = {
      from: `"Real Estate Platform" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    };
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`📧 Message ID: ${result.messageId}`);
    
    return {
      success: true,
      messageId: result.messageId,
      to,
      subject
    };
    
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error);
    
    return {
      success: false,
      error: error.message,
      to,
      subject
    };
  }
} 