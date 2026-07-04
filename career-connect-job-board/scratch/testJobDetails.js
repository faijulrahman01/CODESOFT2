import mongoose from 'mongoose';
import connectDB from '../server/config/db.js';
import Job from '../server/models/Job.js';
import Company from '../server/models/Company.js';
import User from '../server/models/User.js';

// Set env vars
process.env.MONGO_URI = 'mongodb://localhost:27017/career_connect';

const test = async () => {
  await connectDB();
  try {
    const job = await Job.findOne();
    if (!job) {
      console.log('No jobs found in DB.');
      process.exit(0);
    }
    console.log(`Found Job ID: ${job._id}`);
    
    // Attempt populate matching getJobById
    const populated = await Job.findById(job._id)
      .populate('company', 'name logo website location sector employeesCount description')
      .populate('creator', 'name email');

    console.log('Populate Success!');
    console.log(JSON.stringify(populated, null, 2));
  } catch (err) {
    console.error('Error during populate test:', err);
  } finally {
    mongoose.connection.close();
  }
};

test();
