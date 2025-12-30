const express = require('express')
const dotenv = require('dotenv')
const { timeAgo } = require('./datefun')
const { User, VideoSchema, CommentShema } = require('../db.model')


const router = express.Router()
dotenv.config()

// add commands 
router.post("/comment", async (req, res) => {
  try {
    const { videoUrl, email, text } = req.body;

    if (!videoUrl || !email || !text) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findOne({ email });
    const video = await VideoSchema.findOne({ videoUrl });

    if (!user || !video) {
      return res.status(404).json({ message: "User or Video not found" });
    }

    const comment = await CommentShema.create({
      video: video._id,
      user: user._id,
      text
    });


    const commentData = {
      profile: user.channelLogo,
      name: user.name,
      text: text,
      likesCount: comment.likesCount,
      uploadFrom: timeAgo(comment.createdAt),

    }

    return res.status(201).json(commentData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});















//getcommats
router.get("/comments", async (req, res) => {
  try {
    const { videoUrl } = req.query;

    if (!videoUrl) {
      return res.status(400).json({ message: "videoUrl required" });
    }

    const video = await VideoSchema.findOne({ videoUrl });
    if (!video) {
      return res.status(404).json([]);
    }

    const comments = await CommentShema.find({ video: video._id })
      .populate("user", "channelName channelLogo")
      .sort({ createdAt: -1 });
    
    const commentData = comments.map((comment) => ({

      _id: comment._id,
      name: comment.user.channelName,
      profile: comment.user.channelLogo,
      text: comment.text,
      likesCount: comment.likesCount,
      uploadFrom: timeAgo(comment.createdAt),
      parentComment: comment.parentComment,


    }));

    return res.status(200).json(commentData);

  } catch (err) {
    console.error("COMMENTS API ERROR ", err);
    res.status(500).json({ message: "Server Error" });
  }
});










//child commant 
router.post('/comments/reply', async (req, res) => {

  const { videoUrl, parentCommentId, text } = req.body;
  const userId = req.user.id; // from JWT middleware
  console.log(videoUrl)
  try {
    if (!text || !parentCommentId || !videoUrl) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }
    const video = await VideoSchema.findOne({ videoUrl })
    // check parent comment exists
    const parentComment = await CommentShema.findById(parentCommentId);
    if (!parentComment) {
      return res.status(404).json({
        message: "Parent comment not found"
      });
    }

    const childComment = await CommentShema.create({
      video: video._id,
      user: userId,
      text,
      parentComment: parentCommentId
    });


    const user = User.findById(userId)
    const childCommentData = {
      name: user.channelName,
      profile: user.channelLogo,
      likesCount: childComment.likesCount,
      parentCommentId: childComment.parentComment,
      text: text,


      uploadFrom: timeAgo(childComment.createdAt),

    }

    res.status(201).json({
      message: "Reply added successfully",
      comment: childCommentData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
}
)









module.exports = router