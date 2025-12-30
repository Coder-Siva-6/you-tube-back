const express = require('express')
const router = express.Router();
const dotenv = require('dotenv');
const { User, VideoSchema, VideoView } = require('../db.model')

dotenv.config()

router.post("/video/view", async (req, res) => {
  try {
    const { videoUrl } = req.body;
    if (!videoUrl) return res.status(400).json({ message: "Invalid data" });

    const video = await VideoSchema.findOne({ videoUrl });
    if (!video) return res.status(404).json({ message: "Video not found" });

    // Get IP address
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    // Check if view already counted recently
    const alreadyViewed = await VideoView.findOne({
      video: video._id,
      ip
    });

    if (!alreadyViewed) {
      // Increment view
      video.viewsCount += 1;
      await video.save();

      // Log this view
      await VideoView.create({
        video: video._id,
        ip
      });
    }

    res.status(200).json({
      views: video.viewsCount
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router