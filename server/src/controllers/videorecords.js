const express = require('express')
const dotenv = require('dotenv')
const { timeAgo } = require('./datefun')
const { User, VideoSchema } = require('../db.model')


const router = express.Router()
dotenv.config()




router.post("/video/records", async (req, res) => {
  try {
    const { videoUrl, subscriberEmail } = req.body.data;

    if (!videoUrl) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const video = await VideoSchema.findOne({ videoUrl });
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }









    if (subscriberEmail) {
      const user = await User.findOne({ email: subscriberEmail });
      //  if (!user) {
      //    return res.status(404).json({ message: "User not found" });
      //  }

      const liked = video.likes.some(like =>
        like.user.equals(user._id)
      );
      const disliked = video.dislikes.some(like =>
        like.user.equals(user._id)
      );
      const videoRec = {
        views: video.viewsCount,
        likesCount: video.likes.length,
        liked: liked,
        disliked: disliked,
        uploadFrom: timeAgo(video.createdAt)
      };
      return res.status(200).json({ videoRec });
    }

    const videoRec = {
      views: video.viewsCount,
      likesCount: video.likes.length,
      liked: false,
      disliked: false,
      uploadFrom: timeAgo(video.createdAt)
    };

    res.status(200).json({ videoRec });

  } catch (err) {
    console.error("VIDEO RECORD ERROR:", err); // 👈 IMPORTANT
    res.status(500).json({ message: "Server Error" });
  }
});







module.exports = router 