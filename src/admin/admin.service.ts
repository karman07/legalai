import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { EmailService } from '../email/email.service';
import { RegistrationType, UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private firebaseService: FirebaseService,
    private emailService: EmailService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, registrationType, instituteId, ...rest } = createUserDto;

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

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

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
      verificationToken,
      firebaseUid,
      isVerified: false,
      ...rest,
    });

    await user.save();

    return {
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel
        .find()
        .select('-verificationToken -resetPasswordToken')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.userModel.countDocuments(),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId: string) {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserWithPassword(userId: string) {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Return user with password (admin can view passwords)
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      password: user.password, // Hashed password
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      registrationType: user.registrationType,
      instituteId: user.instituteId,
      instituteName: user.instituteName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      lastLogin: user.lastLogin,
      createdAt: user['createdAt'],
      updatedAt: user['updatedAt'],
    };
  }

  async verifyUser(userId: string) {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('User is already verified');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    return {
      message: 'User verified successfully',
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
      },
    };
  }

  async updateUserPassword(userId: string, newPassword: string) {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Update Firebase password
    if (user.firebaseUid) {
      try {
        await this.firebaseService.updateFirebaseUser(user.firebaseUid, {
          password: newPassword,
        });
      } catch (error) {
        console.error('Failed to update Firebase password:', error);
      }
    }

    return {
      message: 'Password updated successfully',
    };
  }

  async deleteUser(userId: string) {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete from Firebase
    if (user.firebaseUid) {
      try {
        await this.firebaseService.deleteFirebaseUser(user.firebaseUid);
      } catch (error) {
        console.error('Failed to delete Firebase user:', error);
      }
    }

    // Delete from MongoDB
    await this.userModel.findByIdAndDelete(userId);

    return {
      message: 'User deleted successfully',
    };
  }

  async toggleUserStatus(userId: string) {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = !user.isActive;
    await user.save();

    return {
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive,
    };
  }

  async updateUserRole(userId: string, newRole: UserRole) {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = newRole;
    await user.save();

    return {
      message: 'User role updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async searchUsers(query: string) {
    const users = await this.userModel
      .find({
        $or: [
          { email: { $regex: query, $options: 'i' } },
          { name: { $regex: query, $options: 'i' } },
          { instituteId: { $regex: query, $options: 'i' } },
        ],
      })
      .select('-password -verificationToken -resetPasswordToken')
      .limit(20);

    return users;
  }

  async getUserStats() {
    const [total, verified, unverified, active, inactive, byRole] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ isVerified: true }),
      this.userModel.countDocuments({ isVerified: false }),
      this.userModel.countDocuments({ isActive: true }),
      this.userModel.countDocuments({ isActive: false }),
      this.userModel.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      verified,
      unverified,
      active,
      inactive,
      byRole: byRole.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    };
  }
}
