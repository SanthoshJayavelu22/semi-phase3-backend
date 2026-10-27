import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/userModel';
import { Institute } from '../src/models/instituteModel';
import { Course } from '../src/models/courseModel';
import { Batch } from '../src/models/batchModel';
import { Student } from '../src/models/studentModel';
import { ExamApplication } from '../src/models/examApplicationModel';
import { HallTicket } from '../src/models/hallTicketModel';
import { Result } from '../src/models/resultModel';
import { Marksheet } from '../src/models/marksheetModel';
import { RevaluationRequest } from '../src/models/revaluationRequestModel';
import { Remittance } from '../src/models/remittanceModel';
import { FeeRecord } from '../src/models/feeRecordModel';

dotenv.config();

const DUMMY_EMAILS = [
  'jashwa46733@gmail.com',
  'institute@apollo.com',
  'institute@fortis.com',
  'pending@manipal.com',
  'rejected@cityhealth.com',
];

const cleanDummyData = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/semiphasethree';
  console.log(`Connecting to database at ${mongoUri}...`);
  await mongoose.connect(mongoUri);

  try {
    console.log('Finding mock institute users...');
    const dummyUsers = await User.find({ email: { $in: DUMMY_EMAILS } });
    const dummyUserIds = dummyUsers.map((u) => u._id);

    const dummyInstitutes = await Institute.find({
      $or: [
        { user: { $in: dummyUserIds } },
        { emailAddress: { $in: DUMMY_EMAILS } },
        { orgName: { $regex: /apollo|fortis|manipal|city health|jashwa/i } },
      ],
    });
    const dummyInstituteIds = dummyInstitutes.map((i) => i._id);

    console.log(`Found ${dummyUsers.length} dummy users and ${dummyInstitutes.length} dummy institutes.`);

    // Delete related records
    const resStud = await Student.deleteMany({
      $or: [
        { institute: { $in: dummyInstituteIds } },
        { enrollmentId: { $in: ['SEMI-2026-9487', 'SEMI-2026-1001', 'SEMI-2026-1002', 'SEMI-2026-1003', 'SEMI-2026-1004', 'SEMI-2026-1005'] } },
      ],
    });
    console.log(`Deleted ${resStud.deletedCount} dummy students.`);

    const resBatch = await Batch.deleteMany({ institute: { $in: dummyInstituteIds } });
    console.log(`Deleted ${resBatch.deletedCount} dummy batches.`);

    const resCourse = await Course.deleteMany({ institute: { $in: dummyInstituteIds } });
    console.log(`Deleted ${resCourse.deletedCount} dummy courses.`);

    const resInst = await Institute.deleteMany({ _id: { $in: dummyInstituteIds } });
    console.log(`Deleted ${resInst.deletedCount} dummy institutes.`);

    const resUser = await User.deleteMany({ _id: { $in: dummyUserIds } });
    console.log(`Deleted ${resUser.deletedCount} dummy users.`);

    // Clean orphaned mock exam / result records if any
    const resExam = await ExamApplication.deleteMany({ student: null });
    const resResult = await Result.deleteMany({ student: null });

    console.log('✅ Cleanup completed successfully. Only real data and Admin accounts remain.');
  } catch (err: any) {
    console.error('Error during cleanup:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
};

cleanDummyData();
