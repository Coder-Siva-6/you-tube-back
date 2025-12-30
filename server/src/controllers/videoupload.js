const express = require('express')
const router = express.Router();
const dotenv = require('dotenv');
const { User, VideoSchema } = require('../db.model')

dotenv.config()

router.post('/api/upload/video', async (req, res) => {
  try {
    const { title, description, videoLink, thumbnailLink, user } = req.body;

    // 1 Find user by email
    const existingUser = await User.findOne({ email: user.email });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // 2 Create video with ObjectId
    await VideoSchema.create({
      title: title,
      description: description,
      thumbnailUrl: thumbnailLink,
      videoUrl: videoLink,
      user: existingUser._id,
      likes: [],
      dislikes: []
    });


    return res.status(201).json({
      message: "Video uploaded successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
});






module.exports = router

