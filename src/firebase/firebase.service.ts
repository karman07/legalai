import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // Initialize Firebase Admin SDK
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const privateKey = this.configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');

    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
    });
  }

  // Create user in Firebase Authentication
  async createFirebaseUser(email: string, password: string): Promise<string> {
    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        emailVerified: false,
      });
      return userRecord.uid;
    } catch (error) {
      throw new Error(`Failed to create Firebase user: ${error.message}`);
    }
  }

  // Delete user from Firebase Authentication
  async deleteFirebaseUser(uid: string): Promise<void> {
    try {
      await admin.auth().deleteUser(uid);
    } catch (error) {
      throw new Error(`Failed to delete Firebase user: ${error.message}`);
    }
  }

  // Update Firebase user
  async updateFirebaseUser(
    uid: string,
    updates: { email?: string; password?: string; emailVerified?: boolean },
  ): Promise<void> {
    try {
      await admin.auth().updateUser(uid, updates);
    } catch (error) {
      throw new Error(`Failed to update Firebase user: ${error.message}`);
    }
  }

  // Verify Firebase ID token
  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await admin.auth().verifyIdToken(token);
    } catch (error) {
      throw new Error(`Failed to verify Firebase token: ${error.message}`);
    }
  }

  // Generate email verification link
  async generateEmailVerificationLink(email: string): Promise<string> {
    try {
      const link = await admin.auth().generateEmailVerificationLink(email);
      return link;
    } catch (error) {
      throw new Error(`Failed to generate verification link: ${error.message}`);
    }
  }

  // Generate password reset link
  async generatePasswordResetLink(email: string): Promise<string> {
    try {
      const link = await admin.auth().generatePasswordResetLink(email);
      return link;
    } catch (error) {
      throw new Error(`Failed to generate password reset link: ${error.message}`);
    }
  }

  getFirebaseApp(): admin.app.App {
    return this.firebaseApp;
  }
}
