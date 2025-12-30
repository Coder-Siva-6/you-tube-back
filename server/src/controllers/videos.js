const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
const {Youtube,User,VideoSchema} = require('../db.model')
const {timeAgo} = require('./datefun')
dotenv.config()





router.get('/api/home/videos', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch paginated videos
    const videos = await VideoSchema
      .find()
      .skip(skip)
      .limit(limit)
      .populate('user', 'channelName channelLogo subscribersCount'); // 👈 BEST SOLUTION

    if (!videos.length) {
      return res.status(404).json({
        success: false,
        message: "No videos available"
      });
    }
    function shuffleImmutable(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

   const suffledVideos = shuffleImmutable(videos)
   
    // Format response
    const response = suffledVideos.map(video => ({
      thumbnailUrl: video.thumbnailUrl,
      title: video.title,
      videoUrl: video.videoUrl,
      viewsCount: video.viewsCount,
      channelName: video.user.channelName,
      channelLogo: video.user.channelLogo,
      subscribersCount :video.user.subscribersCount ,
      viewsCount :video.viewsCount,
      uploadFrom : timeAgo(video.createdAt)     //  using date function from datefun.js for time ago 
    }));
  
    res.status(200).json(response);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});





    








module.exports = router