import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { RegistrationType, UserRole } from './common/enums/user-role.enum';

async function createAdminUser() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  const adminEmail = 'admin@legalpadhai.com';
  const adminPassword = 'Admin@123456';

  // Check if admin already exists
  const existingAdmin = await userModel.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log('Admin user already exists!');
    console.log('Email:', adminEmail);
    await app.close();
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Create admin user
  const admin = new userModel({
    email: adminEmail,
    password: hashedPassword,
    name: 'System Administrator',
    role: UserRole.ADMIN,
    registrationType: RegistrationType.PERSONAL,
    isVerified: true,
    isActive: true,
  });

  await admin.save();

  console.log('✅ Admin user created successfully!');
  console.log('='.repeat(50));
  console.log('Email:', adminEmail);
  console.log('Password:', adminPassword);
  console.log('='.repeat(50));
  console.log('⚠️  Please change the password after first login!');

  await app.close();
}

createAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error creating admin user:', error);
    process.exit(1);
  });
