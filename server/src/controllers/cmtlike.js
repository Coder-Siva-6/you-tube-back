const express = require('express')
const dotenv = require('dotenv')
const { User, VideoSchema, CommentShema, CommentReactionSchema } = require('../db.model')


const router = express.Router()
dotenv.config()

router.post("/comments/react", async (req, res) => {
  try {
    const { commentId, email, type } = req.body;

    if (!commentId || !email || !type) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (!["like", "dislike"].includes(type)) {
      return res.status(400).json({ message: "Invalid reaction type" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const comment = await CommentShema.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const existingReaction = await CommentReactionSchema.findOne({
      comment: commentId,
      user: user._id
    });

    // 🔁 REMOVE SAME REACTION
    if (existingReaction && existingReaction.type === type) {
      await existingReaction.deleteOne();

      if (type === "like") {
        comment.likesCount -= 1;
      }

      await comment.save();

      return res.json({ liked: false, disliked: false, likesCount: comment.likesCount });
    }

    // 🔁 SWITCH REACTION
    if (existingReaction) {
      if (existingReaction.type === "like") {
        comment.likesCount -= 1;
      }

      existingReaction.type = type;
      await existingReaction.save();
    } else {
      await CommentReactionSchema.create({
        comment: commentId,
        user: user._id,
        type
      });
    }

    if (type === "like") {
      comment.likesCount += 1;
    }

    await comment.save();

    return res.json({
      liked: type === "like",
      disliked: type === "dislike",
      likesCount: comment.likesCount
    });

  } catch (err) {
    console.error("COMMENT REACT ERROR", err);
    res.status(500).json({ message: "Server Error" });
  }
});



module.exports = router