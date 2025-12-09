const crypto = require('crypto');
const config = require('../config');

/**
 * Email Service
 * In production, integrate with SendGrid, AWS SES, or similar
 * For now, this logs emails to console in development
 */

/**
 * Send email (placeholder - integrate with email provider)
 */
const sendEmail = async (to, subject, html, text = null) => {
    // In development, just log the email
    if (config.nodeEnv === 'development') {
        console.log('📧 Email would be sent:');
        console.log(`   To: ${to}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Body: ${text || html.substring(0, 100)}...`);
        return { success: true, messageId: `dev-${Date.now()}` };
    }

    // TODO: In production, integrate with email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({ to, from: 'noreply@storcktours.com', subject, html, text });

    return { success: true };
};

/**
 * Send booking confirmation email
 */
const sendBookingConfirmation = async (booking, user, trip) => {
    const subject = `Booking Confirmation - ${trip.title}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Booking Confirmed! 🎉</h1>
      <p>Dear ${user.name},</p>
      <p>Your booking has been confirmed. Here are the details:</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #1f2937;">${trip.title}</h2>
        <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
        <p><strong>Date:</strong> ${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'TBD'}</p>
        <p><strong>Duration:</strong> ${trip.durationDays} days</p>
        <p><strong>Total Price:</strong> ${trip.currency} ${booking.totalPrice}</p>
        <p><strong>Passengers:</strong> ${booking.passengers?.length || 1}</p>
      </div>
      
      <p>Thank you for choosing Storck Tours!</p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        This is an automated email. Please do not reply directly to this message.
      </p>
    </div>
  `;

    return sendEmail(user.email, subject, html);
};

/**
 * Send booking cancellation email
 */
const sendBookingCancellation = async (booking, user, trip) => {
    const subject = `Booking Cancelled - ${trip.title}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626;">Booking Cancelled</h1>
      <p>Dear ${user.name},</p>
      <p>Your booking has been cancelled. Here are the details:</p>
      
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #1f2937;">${trip.title}</h2>
        <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
        <p><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()}</p>
        ${booking.cancellationReason ? `<p><strong>Reason:</strong> ${booking.cancellationReason}</p>` : ''}
      </div>
      
      <p>If you have any questions about your refund, please contact our support team.</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        This is an automated email. Please do not reply directly to this message.
      </p>
    </div>
  `;

    return sendEmail(user.email, subject, html);
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `${config.corsOrigin}/reset-password?token=${resetToken}`;
    const subject = 'Reset Your Password - Storck Tours';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Reset Your Password</h1>
      <p>You requested to reset your password. Click the button below to proceed:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p>Or copy and paste this link in your browser:</p>
      <p style="color: #6b7280; word-break: break-all;">${resetUrl}</p>
      
      <p><strong>This link will expire in 1 hour.</strong></p>
      
      <p>If you didn't request this, please ignore this email.</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        This is an automated email. Please do not reply directly to this message.
      </p>
    </div>
  `;

    return sendEmail(email, subject, html);
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (user) => {
    const subject = 'Welcome to Storck Tours! 🌍';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Welcome to Storck Tours! 🌍</h1>
      <p>Dear ${user.name},</p>
      <p>Thank you for joining Storck Tours! We're excited to have you on board.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #1f2937;">What's Next?</h2>
        <ul style="color: #4b5563;">
          <li>Browse our amazing trips</li>
          <li>Save your favorites</li>
          <li>Book your dream adventure</li>
          <li>Leave reviews to help other travelers</li>
        </ul>
      </div>
      
      <p>Start exploring now and discover your next adventure!</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${config.corsOrigin}/trips" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Explore Trips
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        This is an automated email. Please do not reply directly to this message.
      </p>
    </div>
  `;

    return sendEmail(user.email, subject, html);
};

/**
 * Send booking reminder email
 */
const sendBookingReminder = async (booking, user, trip, daysUntilTrip) => {
    const subject = `Reminder: Your trip to ${trip.destinations[0] || 'adventure'} is coming up!`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Your Trip is Coming Up! 🎒</h1>
      <p>Dear ${user.name},</p>
      <p>Just a friendly reminder that your trip is in <strong>${daysUntilTrip} days</strong>!</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #1f2937;">${trip.title}</h2>
        <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
        <p><strong>Start Date:</strong> ${trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'TBD'}</p>
        <p><strong>Duration:</strong> ${trip.durationDays} days</p>
      </div>
      
      <h3>Don't forget to pack:</h3>
      <ul>
        <li>Valid ID/Passport</li>
        <li>Comfortable shoes</li>
        <li>Weather-appropriate clothing</li>
        <li>Camera for memories!</li>
      </ul>
      
      <p>We can't wait to see you!</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        This is an automated email. Please do not reply directly to this message.
      </p>
    </div>
  `;

    return sendEmail(user.email, subject, html);
};

module.exports = {
    sendEmail,
    sendBookingConfirmation,
    sendBookingCancellation,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendBookingReminder,
};
