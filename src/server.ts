import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';

// IMPORTANT: Load environment variables FIRST
dotenv.config({ path: '.env' });

// Debug: Check if Cloudinary env vars are loaded
console.log('=== Environment Variables Check ===');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✓ Present' : '✗ Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✓ Present' : '✗ Missing');
console.log('===================================');

// Now import routes that depend on environment variables
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import teachingRoutes from './routes/teaching.routes';
import eventRoutes from './routes/event.routes';
import departmentRoutes from './routes/department.routes';
import galleryRoutes from './routes/gallery.routes';
import groupRoutes from './routes/group.routes';
import prayerRoutes from './routes/prayer.routes';
import uploadRoutes from './routes/upload.routes'; 
import { startEventReminderJob } from './jobs/event-reminders';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';
 
 



const app = express();
const PORT = process.env.PORT || 5000;

// FRONTEND_URL=https://digitalchurch.vercel.app
// Middleware
app.use(cors({
  origin: ['https://digitalchurch.vercel.app', 'http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teachings', teachingRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/prayers', prayerRoutes);
app.use('/api/upload', uploadRoutes); 

app.use('/api/admin', adminRoutes);

app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

connectDB().then(() => {
  startEventReminderJob();
  console.log('Event reminder job started');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});





































































// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { connectDB } from './config/database';
// import authRoutes from './routes/auth.routes';
// import userRoutes from './routes/user.routes';
// import teachingRoutes from './routes/teaching.routes';
// import eventRoutes from './routes/event.routes';
// import departmentRoutes from './routes/department.routes';
// import galleryRoutes from './routes/gallery.routes';
// import groupRoutes from './routes/group.routes';
// import prayerRoutes from './routes/prayer.routes';
// import uploadRoutes from './routes/upload.routes';
// import cookieParser from 'cookie-parser';



// dotenv.config();


// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cookieParser());

// // Middleware
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://localhost:3001'],
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Connect to Database
// connectDB();

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/teachings', teachingRoutes);
// app.use('/api/events', eventRoutes);
// app.use('/api/departments', departmentRoutes);
// app.use('/api/gallery', galleryRoutes);
// app.use('/api/groups', groupRoutes);
// app.use('/api/prayers', prayerRoutes);
// app.use('/api/upload', uploadRoutes);

// // Health check
// app.get('/api/health', (req, res) => {
//   res.status(200).json({ status: 'OK', message: 'Server is running' });
// });

// // Error handling middleware
// app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     message: err.message || 'Internal Server Error',
//     error: process.env.NODE_ENV === 'development' ? err : {}
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });