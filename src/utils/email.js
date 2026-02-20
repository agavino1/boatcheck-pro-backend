import nodemailer from 'nodemailer';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const sendVerificationEmail = async (email, firstName, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your BoatCheckPro Email',
    html: `
      <h2>Welcome to BoatCheckPro, ${firstName}!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
        Verify Email
      </a>
      <p>Or copy this link: ${verificationUrl}</p>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't create this account, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export const sendInvoiceEmail = async (email, firstName, invoiceUrl, inspectionDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your BoatCheckPro Invoice',
    html: `
      <h2>Invoice for Your Inspection</h2>
      <p>Hi ${firstName},</p>
      <p>Your payment for the ${inspectionDetails.boatName} inspection has been confirmed.</p>
      <p><strong>Inspection Details:</strong></p>
      <ul>
        <li>Boat: ${inspectionDetails.boatName}</li>
        <li>Type: ${inspectionDetails.inspectionType}</li>
        <li>Amount: $${inspectionDetails.amount}</li>
        <li>Date: ${new Date(inspectionDetails.date).toLocaleDateString()}</li>
      </ul>
      <p>Your invoice is available here: <a href="${invoiceUrl}">Download Invoice</a></p>
      <p>Thank you for using BoatCheckPro!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Invoice email sent to ${email}`);
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
};

export const sendInspectionAssignmentEmail = async (email, firstName, inspectionDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'New Inspection Assigned',
    html: `
      <h2>New Inspection Assignment</h2>
      <p>Hi ${firstName},</p>
      <p>A new inspection has been assigned to you.</p>
      <p><strong>Inspection Details:</strong></p>
      <ul>
        <li>Boat: ${inspectionDetails.boatName}</li>
        <li>Type: ${inspectionDetails.inspectionType}</li>
        <li>Scheduled Date: ${new Date(inspectionDetails.scheduledDate).toLocaleDateString()}</li>
        <li>Location: ${inspectionDetails.location}</li>
        <li>Client: ${inspectionDetails.clientName}</li>
        <li>Contact: ${inspectionDetails.clientEmail}</li>
      </ul>
      <p>Please log in to the system to accept or decline this assignment.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Assignment email sent to ${email}`);
  } catch (error) {
    console.error('Error sending assignment email:', error);
    throw error;
  }
};

export const sendInspectionCompletedEmail = async (email, firstName, inspectionDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Inspection Report is Ready',
    html: `
      <h2>Inspection Report Ready</h2>
      <p>Hi ${firstName},</p>
      <p>The inspection for your boat has been completed!</p>
      <p><strong>Inspection Summary:</strong></p>
      <ul>
        <li>Boat: ${inspectionDetails.boatName}</li>
        <li>Type: ${inspectionDetails.inspectionType}</li>
        <li>Completed: ${new Date(inspectionDetails.completedDate).toLocaleDateString()}</li>
        <li>Overall Condition: ${inspectionDetails.condition}</li>
      </ul>
      <p>Your detailed report is available in your dashboard.</p>
      <p>We'd appreciate if you could rate the inspection experience!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Completion email sent to ${email}`);
  } catch (error) {
    console.error('Error sending completion email:', error);
    throw error;
  }
};
