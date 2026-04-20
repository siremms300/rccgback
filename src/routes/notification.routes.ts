import express from 'express';
import { protect } from '../middleware/auth';
import { UserNotification } from '../models/UserNotification';

const router = express.Router();

router.use(protect);

// Get user notification preferences
router.get('/preferences', async (req: any, res: any) => {
  try {
    let preferences = await UserNotification.findOne({ userId: req.user._id });
    
    if (!preferences) {
      preferences = await UserNotification.create({
        userId: req.user._id,
        emailNotifications: {
          events: true,
          announcements: true,
          teachings: false,
        },
        eventReminders: {
          enabled: true,
          timing: 24,
        },
      });
    }
    
    res.json({ preferences });
  } catch (error: any) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update user notification preferences
router.put('/preferences', async (req: any, res: any) => {
  try {
    const preferences = await UserNotification.findOneAndUpdate(
      { userId: req.user._id },
      { ...req.body },
      { new: true, upsert: true }
    );
    
    res.json({
      message: 'Preferences updated successfully',
      preferences,
    });
  } catch (error: any) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;





























































// import express from 'express';
// import { protect } from '../middleware/auth';
// import { UserNotification } from '../models/UserNotification';

// const router = express.Router();

// router.use(protect);

// // Get user notification preferences
// router.get('/preferences', async (req: any, res: any) => {
//   try {
//     let preferences = await UserNotification.findOne({ userId: req.user._id });
    
//     if (!preferences) {
//       preferences = await UserNotification.create({
//         userId: req.user._id,
//         emailNotifications: {
//           events: true,
//           announcements: true,
//           teachings: false,
//         },
//         eventReminders: {
//           enabled: true,
//           timing: 24,
//         },
//       });
//     }
    
//     res.json({ preferences });
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Update user notification preferences
// router.put('/preferences', async (req: any, res: any) => {
//   try {
//     const preferences = await UserNotification.findOneAndUpdate(
//       { userId: req.user._id },
//       { ...req.body },
//       { new: true, upsert: true }
//     );
    
//     res.json({
//       message: 'Preferences updated successfully',
//       preferences,
//     });
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// });

// export default router;