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
import { Quiz, QuizDocument } from '../schemas/quiz.schema';
import { Pdf, PdfDocument } from '../schemas/pdf.schema';
import { AudioLesson, AudioLessonDocument } from '../schemas/audio-lesson.schema';
import { Note, NoteDocument } from '../schemas/note.schema';
import { Resource, ResourceDocument } from '../schemas/resource.schema';
import { Blog, BlogDocument } from '../schemas/blog.schema';
import { Chat } from '../schemas/chat.schema';
import { Conversation } from '../schemas/conversation.schema';
import { AnswerCheck, AnswerCheckDocument } from '../schemas/answer-check.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { EmailService } from '../email/email.service';
import { RegistrationType, UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(Pdf.name) private pdfModel: Model<PdfDocument>,
    @InjectModel(AudioLesson.name) private audioLessonModel: Model<AudioLessonDocument>,
    @InjectModel(Note.name) private noteModel: Model<NoteDocument>,
    @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Chat.name) private chatModel: Model<any>,
    @InjectModel(Conversation.name) private conversationModel: Model<any>,
    @InjectModel(AnswerCheck.name) private answerCheckModel: Model<AnswerCheckDocument>,
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

  async getSystemOverview() {
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      totalQuizzes,
      publishedQuizzes,
      totalPdfs,
      activePdfs,
      totalAudioLessons,
      totalNotes,
      totalResources,
      activeResources,
      totalBlogs,
      publishedBlogs,
      totalChats,
      totalConversations,
      totalAnswerChecks,
      uniqueAuthenticatedVisitors,
      anonymousVisitors,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ isActive: true }),
      this.userModel.countDocuments({ isVerified: true }),
      this.quizModel.countDocuments(),
      this.quizModel.countDocuments({ isPublished: true }),
      this.pdfModel.countDocuments(),
      this.pdfModel.countDocuments({ isActive: true }),
      this.audioLessonModel.countDocuments(),
      this.noteModel.countDocuments(),
      this.resourceModel.countDocuments(),
      this.resourceModel.countDocuments({ isActive: true }),
      this.blogModel.countDocuments(),
      this.blogModel.countDocuments({ isPublished: true }),
      this.chatModel.countDocuments(),
      this.conversationModel.countDocuments(),
      this.answerCheckModel.countDocuments(),
      this.conversationModel.distinct('userId', { userId: { $ne: null } }).then((ids: any[]) => ids.length),
      this.conversationModel.countDocuments({ $or: [{ userId: null }, { userId: { $exists: false } }] }),
    ]);

    const totalVisitors = uniqueAuthenticatedVisitors + anonymousVisitors;

    return {
      generatedAt: new Date().toISOString(),
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          verified: verifiedUsers,
        },
        quizzes: {
          total: totalQuizzes,
          published: publishedQuizzes,
        },
        pdfs: {
          total: totalPdfs,
          active: activePdfs,
        },
        audioLessons: {
          total: totalAudioLessons,
        },
        notes: {
          total: totalNotes,
        },
        resources: {
          total: totalResources,
          active: activeResources,
        },
        blogs: {
          total: totalBlogs,
          published: publishedBlogs,
        },
        chats: {
          totalMessages: totalChats,
          totalConversations,
        },
        visitors: {
          total: totalVisitors,
          authenticated: uniqueAuthenticatedVisitors,
          anonymous: anonymousVisitors,
        },
        answerChecks: {
          total: totalAnswerChecks,
        },
      },
      moduleVolume: [
        { module: 'Users', value: totalUsers },
        { module: 'Quizzes', value: totalQuizzes },
        { module: 'PDFs', value: totalPdfs },
        { module: 'Audio', value: totalAudioLessons },
        { module: 'Notes', value: totalNotes },
        { module: 'Resources', value: totalResources },
        { module: 'Blogs', value: totalBlogs },
        { module: 'Answer Checks', value: totalAnswerChecks },
      ],
      crudCoverage: [
        { module: 'Users', basePath: '/admin/users', create: true, read: true, update: true, delete: true },
        { module: 'Quizzes', basePath: '/admin/quizzes', create: true, read: true, update: true, delete: true },
        { module: 'PDFs', basePath: '/admin/pdfs', create: true, read: true, update: true, delete: true },
        { module: 'Audio Lessons', basePath: '/admin/audio-lessons', create: true, read: true, update: true, delete: true },
        { module: 'Resources', basePath: '/admin/resources', create: true, read: true, update: true, delete: true },
        { module: 'Blogs', basePath: '/admin/blogs', create: true, read: true, update: true, delete: true },
      ],
      routeInventory: {
        admin: [
          '/admin/users',
          '/admin/users/stats',
          '/admin/system/overview',
          '/admin/quizzes',
          '/admin/pdfs',
          '/admin/audio-lessons',
          '/admin/resources',
          '/admin/blogs',
        ],
        publicApi: [
          '/auth/login',
          '/quizzes',
          '/pdfs',
          '/pdfs/years',
          '/audio-lessons',
          '/notes',
          '/search',
          '/chat',
          '/resources',
          '/blogs',
          '/answer-check',
        ],
      },
    };
  }
}
