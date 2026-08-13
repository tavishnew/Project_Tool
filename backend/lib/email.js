import nodemailer from 'nodemailer';

const APP_URL = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173';

let transporter;

function smtpConfig() {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'];
  const missing = required.filter((name) => !process.env[name]);

  if (missing.length) {
    return { missing };
  }

  const port = Number.parseInt(process.env.SMTP_PORT, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { missing: ['SMTP_PORT (a valid port number)'] };
  }

  return {
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    from: process.env.EMAIL_FROM,
  };
}

function getTransporter(config) {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
  }
  return transporter;
}

async function sendEmail({ recipientEmail, subject, html, text }) {
  const config = smtpConfig();
  if (config.missing) {
    const error = `SMTP email is not configured: missing ${config.missing.join(', ')}`;
    console.warn(`[EMAIL] ${error}`);
    return { success: false, error };
  }

  try {
    const result = await getTransporter(config).sendMail({
      from: config.from,
      to: recipientEmail,
      subject,
      html,
      text,
    });
    console.log(`[EMAIL] Sent message to ${recipientEmail} (id: ${result.messageId})`);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown email delivery error';
    console.error(`[EMAIL] Failed to send message to ${recipientEmail}: ${error}`);
    return { success: false, error };
  }
}

function invitationHtml({ inviterName, subjectName, invitationUrl, isWorkspace = false }) {
  const destination = isWorkspace ? 'workspace' : 'project';
  return `
<!doctype html>
<html lang="en">
  <body style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937;max-width:600px;margin:0 auto;padding:24px">
    <h1 style="margin:0 0 16px">You are invited</h1>
    <p><strong>${escapeHtml(inviterName)}</strong> invited you to join the ${destination} <strong>${escapeHtml(subjectName)}</strong>.</p>
    <p><a href="${escapeHtml(invitationUrl)}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px">Accept invitation</a></p>
    <p style="font-size:14px;color:#6b7280">This invitation expires in seven days. If you were not expecting it, you can safely ignore this email.</p>
    <p style="font-size:13px;color:#6b7280;word-break:break-all">${escapeHtml(invitationUrl)}</p>
  </body>
</html>`.trim();
}

function invitationText({ inviterName, subjectName, invitationUrl, isWorkspace = false }) {
  const destination = isWorkspace ? 'workspace' : 'project';
  return `${inviterName} invited you to join the ${destination} ${subjectName}.\n\nAccept invitation: ${invitationUrl}\n\nThis invitation expires in seven days. If you were not expecting it, you can safely ignore this email.`;
}

/** Send a project invitation through the configured SMTP service. */
export async function sendProjectInvite({ recipientEmail, inviterName, projectName, inviteUrl }) {
  return sendEmail({
    recipientEmail,
    subject: `You are invited to collaborate on ${projectName}`,
    html: invitationHtml({ inviterName, subjectName: projectName, invitationUrl: inviteUrl }),
    text: invitationText({ inviterName, subjectName: projectName, invitationUrl: inviteUrl }),
  });
}

/** Send a workspace invitation through the configured SMTP service. */
export async function sendWorkspaceInvite({ recipientEmail, inviterName, workspaceName, invitationToken }) {
  const inviteUrl = `${APP_URL}/workspace-invite/${invitationToken}`;
  return sendEmail({
    recipientEmail,
    subject: `You are invited to collaborate on ${workspaceName}`,
    html: invitationHtml({
      inviterName,
      subjectName: workspaceName,
      invitationUrl: inviteUrl,
      isWorkspace: true,
    }),
    text: invitationText({
      inviterName,
      subjectName: workspaceName,
      invitationUrl: inviteUrl,
      isWorkspace: true,
    }),
  });
}

/** Send a short-lived code for the direct password-update flow. */
export async function sendPasswordUpdateCodeEmail({ recipientEmail, userName, code }) {
  return sendEmail({
    recipientEmail,
    subject: 'Your password update code',
    html: `
<!doctype html>
<html lang="en">
  <body style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937;max-width:600px;margin:0 auto;padding:24px">
    <h1 style="margin:0 0 16px">Verify your password update</h1>
    <p>Hi ${escapeHtml(userName)},</p>
    <p>Enter this one-time code in Orbit to choose a new password:</p>
    <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:24px 0">${escapeHtml(code)}</p>
    <p style="font-size:14px;color:#6b7280">This code expires in 15 minutes and can only be used once. If you did not request a password update, you can safely ignore this email.</p>
  </body>
</html>`.trim(),
    text: `Hi ${userName},\n\nEnter this one-time code in Orbit to choose a new password: ${code}\n\nThis code expires in 15 minutes and can only be used once. If you did not request a password update, you can safely ignore this email.`,
  });
}

/** Send a password-reset link through the configured SMTP service. */
export async function sendPasswordResetEmail({ recipientEmail, userName, resetToken }) {
  const resetUrl = `${APP_URL}/reset-password/${resetToken}`;
  return sendEmail({
    recipientEmail,
    subject: 'Reset your password',
    html: `
<!doctype html>
<html lang="en">
  <body style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937;max-width:600px;margin:0 auto;padding:24px">
    <h1 style="margin:0 0 16px">Reset your password</h1>
    <p>Hi ${escapeHtml(userName)},</p>
    <p>We received a request to reset your password. Use the link below to choose a new password.</p>
    <p><a href="${escapeHtml(resetUrl)}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px">Reset password</a></p>
    <p style="font-size:14px;color:#6b7280">This link expires in 30 minutes and can only be used once. If you did not request a reset, you can safely ignore this email.</p>
    <p style="font-size:13px;color:#6b7280;word-break:break-all">${escapeHtml(resetUrl)}</p>
  </body>
</html>`.trim(),
    text: `Hi ${userName},\n\nWe received a request to reset your password. Use this link to choose a new password: ${resetUrl}\n\nThis link expires in 30 minutes and can only be used once. If you did not request a reset, you can safely ignore this email.`,
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export { sendEmail };
