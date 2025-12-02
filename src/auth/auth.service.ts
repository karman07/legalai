import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument } from '../schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { EmailService } from '../email/email.service';
import { RegistrationType, UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private firebaseService: FirebaseService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, registrationType, instituteId, ...rest } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate registration type requirements
    if (registrationType === RegistrationType.INSTITUTE && !instituteId) {
      throw new BadRequestException('Institute ID is required for institute registration');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Firebase user
    let firebaseUid: string;
    try {
      firebaseUid = await this.firebaseService.createFirebaseUser(email, password);
    } catch (error) {
      throw new BadRequestException(`Failed to create Firebase user: ${error.message}`);
    }

    // Create user in MongoDB
    const user = new this.userModel({
      email,
      password: hashedPassword,
      registrationType,
      instituteId,
      firebaseUid,
      role: UserRole.USER,
      isVerified: false,
      ...rest,
    });

    await user.save();

    // Auto-verify user (no email verification needed)
    user.isVerified = true;
    await user.save();

    // Update Firebase user to verified
    try {
      await this.firebaseService.updateFirebaseUser(firebaseUid, {
        emailVerified: true,
      });
    } catch (error) {
      console.error('Failed to update Firebase user:', error);
    }

    return {
      message: 'Registration successful. You can now login.',
      userId: user._id,
      email: user.email,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated. Please contact admin.');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        registrationType: user.registrationType,
      },
    };
  }

  async googleSignIn(idToken: string) {
    try {
      // Verify Google ID token with Firebase
      const decodedToken = await this.firebaseService.verifyIdToken(idToken);
      const { email, name, uid: firebaseUid, picture } = decodedToken;

      if (!email) {
        throw new BadRequestException('Email not found in Google account');
      }

      // Check if user already exists
      let user = await this.userModel.findOne({ email });

      if (!user) {
        // Create new user from Google Sign-In
        user = new this.userModel({
          email,
          name: name || email.split('@')[0],
          firebaseUid,
          role: UserRole.USER,
          isVerified: true, // Google users are auto-verified
          registrationType: RegistrationType.PERSONAL,
          password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10), // Random password
        });
        await user.save();
      } else if (!user.firebaseUid) {
        // Link existing user to Firebase
        user.firebaseUid = firebaseUid;
        user.isVerified = true;
        await user.save();
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const payload = { sub: user._id.toString(), email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
          registrationType: user.registrationType,
        },
      };
    } catch (error) {
      throw new UnauthorizedException(`Google Sign-In failed: ${error.message}`);
    }
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async validateUser(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
