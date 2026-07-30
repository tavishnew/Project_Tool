import { Resend } from 'resend';

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

/**
 * Send workspace invitation email via Resend
 * @param {Object} data
 * @param {string} data.recipientEmail
 * @param {string} data.inviterName
 * @param {string} data.workspaceName
 * @param {string} data.invitationToken
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendWorkspaceInvite(data) {
  const { recipientEmail, inviterName, workspaceName, invitationToken } = data;

  // Validate required env vars
  if (!process.env.RESEND_API_KEY) {
    console.warn('[EMAIL] RESEND_API_KEY not set, skipping email send');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const inviteUrl = `${APP_URL}/invite/${invitationToken}`;

  try {
    const resend = getResendClient();
    const { data: emailData, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: recipientEmail,
      subject: `You're invited to collaborate on ${workspaceName}`,
      html: generateInviteHtml({
        inviterName,
        workspaceName,
        inviteUrl,
      }),
      text: generateInviteText({
        inviterName,
        workspaceName,
        inviteUrl,
      }),
    });

    if (error) {
      console.error('[EMAIL] Failed to send invitation:', error);
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL] Invitation sent to ${recipientEmail} (id: ${emailData?.id})`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[EMAIL] Exception sending invitation:', message);
    return { success: false, error: message };
  }
}

function generateInviteHtml({ inviterName, workspaceName, inviteUrl }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0; padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">You're Invited</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0; font-size: 16px;">Join <strong>${escapeHtml(workspaceName)}</strong> workspace</p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 32px;">
    <p style="font-size: 16px; margin: 0 0 16px;">
      Hi there,
    </p>

    <p style="font-size: 16px; margin: 0 0 24px;">
      <strong>${escapeHtml(inviterName)}</strong> invited you to join <strong>${escapeHtml(workspaceName)}</strong> — a workspace for managing projects and tasks together.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${escapeHtml(inviteUrl)}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);">
        Accept Invitation
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px; text-align: center;">
      Or copy this link:<br>
      <a href="${escapeHtml(inviteUrl)}" style="color: #667eea; word-break: break-all;">${escapeHtml(inviteUrl)}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

    <div style="font-size: 13px; color: #9ca3af; line-height: 1.8;">
      <p style="margin: 0 0 8px;"><strong>Important:</strong> This invitation expires in <strong>7 days</strong>.</p>
      <p style="margin: 0 0 8px;">If you don't have an account yet, you'll create one when you accept.</p>
      <p style="margin: 0;">Didn't expect this invitation? You can safely ignore this email.</p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #9ca3af;">
    <p style="margin: 0;">© ${new Date().getFullYear()} Orbit. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

function generateInviteText({ inviterName, workspaceName, inviteUrl }) {
  return `
You're invited to join ${workspaceName}

Hi there,

${inviterName} invited you to join ${workspaceName} — a workspace for managing projects and tasks together.

Accept your invitation: ${inviteUrl}

This invitation expires in 7 days. If you don't have an account yet, you'll create one when you accept.

Didn't expect this invitation? You can safely ignore this email.

© ${new Date().getFullYear()} Orbit. All rights reserved.
  `.trim();
}

/**
 * Send project invitation email via Resend
 * @param {Object} data
 * @param {string} data.recipientEmail
 * @param {string} data.inviterName
 * @param {string} data.projectName
 * @param {string} data.inviteUrl
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendProjectInvite(data) {
  const { recipientEmail, inviterName, projectName, inviteUrl } = data;

  if (!process.env.RESEND_API_KEY) {
    console.warn('[EMAIL] RESEND_API_KEY not set, skipping email send');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const resend = getResendClient();
    const { data: emailData, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: recipientEmail,
      subject: `You're invited to collaborate on ${projectName}`,
      html: generateProjectInviteHtml({ inviterName, projectName, inviteUrl }),
      text: generateProjectInviteText({ inviterName, projectName, inviteUrl }),
    });

    if (error) {
      console.error('[EMAIL] Failed to send project invite:', error);
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL] Project invite sent to ${recipientEmail} (id: ${emailData?.id})`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[EMAIL] Exception sending project invite:', message);
    return { success: false, error: message };
  }
}

function generateProjectInviteHtml({ inviterName, projectName, inviteUrl }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0; padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">You're Invited</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0; font-size: 16px;">Join project <strong>${escapeHtml(projectName)}</strong></p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 32px;">
    <p style="font-size: 16px; margin: 0 0 16px;">Hi there,</p>

    <p style="font-size: 16px; margin: 0 0 24px;">
      <strong>${escapeHtml(inviterName)}</strong> invited you to join <strong>${escapeHtml(projectName)}</strong> — a project in Orbit for managing tasks together.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${escapeHtml(inviteUrl)}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);">
        Accept Invitation
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px; text-align: center;">
      Or copy this link:<br>
      <a href="${escapeHtml(inviteUrl)}" style="color: #667eea; word-break: break-all;">${escapeHtml(inviteUrl)}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

    <div style="font-size: 13px; color: #9ca3af; line-height: 1.8;">
      <p style="margin: 0 0 8px;"><strong>Important:</strong> This invitation expires in <strong>7 days</strong>.</p>
      <p style="margin: 0 0 8px;">If you don't have an account yet, you'll create one when you accept.</p>
      <p style="margin: 0;">Didn't expect this invitation? You can safely ignore this email.</p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #9ca3af;">
    <p style="margin: 0;">© ${new Date().getFullYear()} Orbit. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

function generateProjectInviteText({ inviterName, projectName, inviteUrl }) {
  return `
You're invited to join ${projectName}

Hi there,

${inviterName} invited you to join ${projectName} — a project in Orbit for managing tasks together.

Accept your invitation: ${inviteUrl}

This invitation expires in 7 days. If you don't have an account yet, you'll create one when you accept.

Didn't expect this invitation? You can safely ignore this email.

© ${new Date().getFullYear()} Orbit. All rights reserved.
  `.trim();
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

/**
 * Send password reset email via Resend
 * @param {Object} data
 * @param {string} data.recipientEmail
 * @param {string} data.userName
 * @param {string} data.resetToken
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendPasswordResetEmail(data) {
  const { recipientEmail, userName, resetToken } = data;

  // Validate required env vars
  if (!process.env.RESEND_API_KEY) {
    console.warn('[EMAIL] RESEND_API_KEY not set, skipping email send');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const resetUrl = `${APP_URL}/reset-password/${resetToken}`;

  try {
    const resend = getResendClient();
    const { data: emailData, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: recipientEmail,
      subject: 'Reset your password',
      html: generateResetPasswordHtml({
        userName,
        resetUrl,
      }),
      text: generateResetPasswordText({
        userName,
        resetUrl,
      }),
    });

    if (error) {
      console.error('[EMAIL] Failed to send password reset:', error);
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL] Password reset sent to ${recipientEmail} (id: ${emailData?.id})`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[EMAIL] Exception sending password reset:', message);
    return { success: false, error: message };
  }
}

function generateResetPasswordHtml({ userName, resetUrl }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0; padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Reset Your Password</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0; font-size: 16px;">Secure link to regain access to your account</p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 32px;">
    <p style="font-size: 16px; margin: 0 0 16px;">
      Hi ${escapeHtml(userName)},
    </p>

    <p style="font-size: 16px; margin: 0 0 24px;">
      You requested a password reset for your Orbit account. Click the button below to create a new password:
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${escapeHtml(resetUrl)}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);">
        Reset Password
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px; text-align: center;">
      Or copy this link:<br>
      <a href="${escapeHtml(resetUrl)}" style="color: #667eea; word-break: break-all;">${escapeHtml(resetUrl)}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

    <div style="font-size: 13px; color: #9ca3af; line-height: 1.8;">
      <p style="margin: 0 0 8px;"><strong>Important:</strong> This link expires in <strong>30 minutes</strong>.</p>
      <p style="margin: 0 0 8px;">If you didn't request this reset, you can safely ignore this email. Your password will remain unchanged.</p>
      <p style="margin: 0;">For security, this link can only be used once.</p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #9ca3af;">
    <p style="margin: 0;">© ${new Date().getFullYear()} Orbit. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

function generateResetPasswordText({ userName, resetUrl }) {
  return `
Reset Your Password

Hi ${userName},

You requested a password reset for your Orbit account. Click the link below to create a new password:

${resetUrl}

This link expires in 30 minutes. If you didn't request this reset, you can safely ignore this email. Your password will remain unchanged.

For security, this link can only be used once.

© ${new Date().getFullYear()} Orbit. All rights reserved.
  `.trim();
}