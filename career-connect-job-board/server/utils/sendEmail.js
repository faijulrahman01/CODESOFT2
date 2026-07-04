import nodemailer from 'nodemailer';

const isSmtpConfigured = 
  process.env.SMTP_HOST && 
  process.env.SMTP_PORT && 
  process.env.SMTP_USER && 
  process.env.SMTP_PASS;

let transporter;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // True for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('Nodemailer SMTP Transporter configured.');
} else {
  console.log('SMTP credentials missing. Email alerts will simulate output in terminal.');
}

/**
 * Dispatches styled email notifications.
 * Falls back to terminal logging if SMTP details are missing.
 * 
 * @param {String} to Recipient email address
 * @param {String} subject Subject line
 * @param {String} htmlBody HTML email layout content
 */
export const sendEmail = async ({ to, subject, htmlBody }) => {
  if (isSmtpConfigured) {
    try {
      const mailOptions = {
        from: `"CareerConnect Alerts" <${process.env.SMTP_FROM || 'no-reply@careerconnect.com'}>`,
        to,
        subject,
        html: htmlBody,
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email dispatched successfully to ${to}. Message ID: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Nodemailer dispatch failed:', error);
    }
  }

  // Local/Evaluation Terminal Fallback Output
  console.log(`
======================================================
[SIMULATED EMAIL DISPATCH]
To: ${to}
Subject: ${subject}
Body: 
${htmlBody.replace(/<[^>]*>/g, '\n').replace(/\n\s*\n/g, '\n')}
======================================================
  `);
  return { simulated: true };
};

// PRESET HTML EMAIL TEMPLATES

/**
 * Registration Verification Template
 */
export const getVerificationEmailBody = (name, token) => {
  const verifyLink = `http://localhost:5173/verify/${token}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #16a34a; text-align: center;">Welcome to CareerConnect</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thank you for registering an account on CareerConnect. Please verify your email to unlock your job portal access.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyLink}" style="background-color: #16a34a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Verify Email Address</a>
      </div>
      <p style="font-size: 12px; color: #666666;">If the button doesn't work, copy-paste this link in your browser:<br>${verifyLink}</p>
      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
      <p style="font-size: 11px; color: #999999; text-align: center;">CareerConnect Internship Project. No reply required.</p>
    </div>
  `;
};

/**
 * Application Submitted Confirmation Template
 */
export const getAppSubmissionEmailBody = (candidateName, jobTitle, companyName) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #16a34a;">Application Submitted!</h2>
      <p>Hello <strong>${candidateName}</strong>,</p>
      <p>Your job application has been successfully submitted to <strong>${companyName}</strong> for the role of <strong>${jobTitle}</strong>.</p>
      <p>The recruitment team will review your biography, skills, and resume details. You will receive an email update once your status is progressed.</p>
      <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; font-size: 12px; color: #15803d;"><strong>Applied Role:</strong> ${jobTitle}<br><strong>Company:</strong> ${companyName}</p>
      </div>
      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
      <p style="font-size: 11px; color: #999999; text-align: center;">CareerConnect Platform. Track updates in your Dashboard.</p>
    </div>
  `;
};

/**
 * Application Status Update Template (Accept/Reject)
 */
export const getStatusUpdateEmailBody = (candidateName, jobTitle, companyName, status, feedback) => {
  const isAccepted = status === 'accepted';
  const color = isAccepted ? '#16a34a' : '#dc2626';
  const headerText = isAccepted ? 'Congratulations! Job Offer Received' : 'Application Update';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: ${color};">${headerText}</h2>
      <p>Hello <strong>${candidateName}</strong>,</p>
      <p>Your application status for the role of <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated to: <strong style="color: ${color}; text-transform: uppercase;">${status}</strong>.</p>
      
      ${feedback ? `
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #f3f4f6;">
          <h4 style="margin: 0 0 5px 0; color: #374151;">Feedback from Hiring Team:</h4>
          <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.5;">${feedback}</p>
        </div>
      ` : ''}

      ${isAccepted ? `
        <p>The team will get in touch with you shortly with offer contract documents and onboarding details.</p>
      ` : `
        <p>Thank you for your interest in joining our team. We appreciate your effort and wish you the best in your search.</p>
      `}
      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
      <p style="font-size: 11px; color: #999999; text-align: center;">CareerConnect Platform.</p>
    </div>
  `;
};

/**
 * Interview Scheduled Template
 */
export const getInterviewEmailBody = (candidateName, jobTitle, companyName, dateString, details) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #4f46e5;">Interview Invitation</h2>
      <p>Hello <strong>${candidateName}</strong>,</p>
      <p>Good news! <strong>${companyName}</strong> has selected your profile and scheduled an interview for the role of <strong>${jobTitle}</strong>.</p>
      
      <div style="background-color: #f5f3ff; border-left: 4px solid #4f46e5; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #4f46e5;"><strong>Interview Time:</strong> ${new Date(dateString).toLocaleString()}</p>
        ${details ? `<p style="margin: 0; font-size: 12px; color: #6b21a8;"><strong>Meeting Details:</strong> <br>${details}</p>` : ''}
      </div>
      
      <p>Please ensure you are ready on time. If you need to request a reschedule, contact the recruiter directly.</p>
      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
      <p style="font-size: 11px; color: #999999; text-align: center;">CareerConnect Platform.</p>
    </div>
  `;
};
