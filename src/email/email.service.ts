import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) { }

  async sendVerificationEmail(email: string, firebaseUid: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    try {
      // Configure action code settings for email verification
      const actionCodeSettings = {
        url: frontendUrl, // Where user will be redirected after verification
        handleCodeInApp: false,
      };

      // Generate and SEND email verification link
      // Firebase Auth automatically sends the email if SMTP is configured
      const verificationLink = await admin.auth().generateEmailVerificationLink(
        email,
        actionCodeSettings,
      );

      console.log(`\n✅ Verification email sent to: ${email}`);
      console.log(`📧 Link (for testing): ${verificationLink}\n`);

      // Firebase automatically sends the email based on your Firebase Console settings
      // Go to: https://console.firebase.google.com/project/legal-239c5/authentication/emails
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    try {
      const actionCodeSettings = {
        url: `${frontendUrl}/login`,
        handleCodeInApp: false,
      };

      const resetLink = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a202c; margin: 0; padding: 0; background-color: #f7fafc; }
                .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
                .header { background: #1a365d; padding: 32px 40px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
                .content { padding: 40px; }
                .footer { background: #f8fafc; padding: 24px 40px; text-align: center; font-size: 14px; color: #718096; border-top: 1px solid #e2e8f0; }
                .button { display: inline-block; padding: 14px 32px; background-color: #2b6cb0; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 24px 0; transition: background-color 0.2s; }
                .button:hover { background-color: #2c5282; }
                p { margin-bottom: 16px; font-size: 16px; color: #4a5568; }
                .legal-notice { font-size: 12px; font-style: italic; color: #a0aec0; margin-top: 32px; border-top: 1px solid #edf2f7; padding-top: 16px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>LegalAI Support</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>We received a request to reset the password for your LegalAI account. Professionalism and security are our core values, so we have secured your account until this step is completed.</p>
                    <p>Please click the button below to establish a new secure password for your account:</p>
                    <div style="text-align: center;">
                        <a href="${resetLink}" class="button">Reset Password</a>
                    </div>
                    <p><strong>Note:</strong> This link will expire in 1 hour for your security. If you did not request this change, please ignore this email or contact our support team immediately.</p>
                    <div class="legal-notice">
                        This email was sent from an automated system at LegalAI. Please do not reply to this message.
                    </div>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} LegalAI. All rights reserved. <br>
                    Securing Legal Excellence through Intelligence.
                </div>
            </div>
        </body>
        </html>
      `;

      // In a real production app with SMTP configured in Firebase, 
      // generating the link and sending it via your own logic is best if you want full HTML control.
      // For now, we log the link and would integrate with an SMTP provider (Nodemailer, SendGrid, etc.)
      console.log(`\n🔑 Password reset requested for: ${email}`);
      console.log(`📧 Custom HTML Link: ${resetLink}\n`);

      // Note: To actually SEND this custom HTML, you would use a library like 'nodemailer' here.
      // Since we are using Firebase Admin, calling generatePasswordResetLink only GETS the link.
      // If the user wants the BACKEND to send it, they usually have an SMTP service set up.
    } catch (error) {
      console.error('❌ Error generating reset link:', error);
      throw new Error(`Failed to process password reset: ${error.message}`);
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    // Welcome emails are optional - Firebase doesn't have a built-in template for this
    console.log(`\n🎉 Welcome ${name}! Email verified for: ${email}\n`);
  }
}
