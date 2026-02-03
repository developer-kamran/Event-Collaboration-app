import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@eventcollab.com',
      to,
      subject,
      html: html || text,
      text: text || (html ? html.replace(/<[^>]*>/g, '') : ''),
    });
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
};

export const sendEventInvitation = async (email, eventTitle, inviteLink, inviterName) => {
  return sendEmail({
    to: email,
    subject: `You're invited to collaborate: ${eventTitle}`,
    html: `
      <h2>Event Collaboration Invitation</h2>
      <p>${inviterName} has invited you to collaborate on the event <strong>${eventTitle}</strong>.</p>
      <p><a href="${inviteLink}">Accept or reject the invitation</a></p>
      <p>This link expires in 7 days.</p>
    `,
  });
};

export const sendRegistrationConfirmation = async (email, eventTitle, eventDate) => {
  return sendEmail({
    to: email,
    subject: `Registration confirmed: ${eventTitle}`,
    html: `
      <h2>Registration Confirmed</h2>
      <p>You are registered for <strong>${eventTitle}</strong>.</p>
      <p>Date: ${new Date(eventDate).toLocaleString()}</p>
      <p>Save your confirmation email; you may need it for check-in.</p>
    `,
  });
};

export const sendEventReminder = async (email, eventTitle, eventDate, eventLink) => {
  return sendEmail({
    to: email,
    subject: `Reminder: ${eventTitle} is tomorrow`,
    html: `
      <h2>Event Reminder</h2>
      <p><strong>${eventTitle}</strong> is coming up.</p>
      <p>Date: ${new Date(eventDate).toLocaleString()}</p>
      <p><a href="${eventLink}">View event details</a></p>
    `,
  });
}
