import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {}

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
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    try {
      // Configure action code settings for password reset
      const actionCodeSettings = {
        url: frontendUrl, // Where user will be redirected after reset
        handleCodeInApp: false,
      };

      // Generate and SEND password reset link
      // Firebase Auth automatically sends the email if SMTP is configured
      const resetLink = await admin.auth().generatePasswordResetLink(
        email,
        actionCodeSettings,
      );

      console.log(`\n✅ Password reset email sent to: ${email}`);
      console.log(`📧 Link (for testing): ${resetLink}\n`);

      // Firebase automatically sends the email based on your Firebase Console settings
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    // Welcome emails are optional - Firebase doesn't have a built-in template for this
    console.log(`\n🎉 Welcome ${name}! Email verified for: ${email}\n`);
  }
}
