import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import logger from './logger';
import { User } from '../models/userModel';

dotenv.config();

/**
 * Seed Super Admin and Board admin accounts only (No dummy data)
 */
export const seedSuperAdmin = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const superAdminHash = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!', salt);
    const boardHash = await bcrypt.hash(process.env.BOARD_PASSWORD || 'BoardPass123!', salt);

    const adminUsers = [
      {
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@academy.com',
        name: 'Academy Super Admin',
        password: superAdminHash,
        role: 'super_admin',
        isEmailVerified: true,
      },
      {
        email: process.env.BOARD_EMAIL || 'board@academy.com',
        name: 'Academic Board Controller',
        password: boardHash,
        role: 'board',
        isEmailVerified: true,
      },
    ];

    for (const u of adminUsers) {
      const existingUser = await User.findOne({ email: u.email });
      if (!existingUser) {
        await User.create(u);
        logger.info(`✅ Admin user seeded: ${u.email} (${u.role})`);
      }
    }
  } catch (err: any) {
    console.error('Error seeding admin accounts:', err.message);
    logger.error('Error seeding admin accounts: ' + err.message);
  }
};
