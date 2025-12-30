const express = require('express')
const dotenv = require('dotenv')
const { User, VideoSchema } = require('../db.model')


const router = express.Router()
dotenv.config()


router.post("/like", async (req, res) => {
  try {
    const { videoUrl, subscriberEmail } = req.body.data;

    if (!videoUrl || !subscriberEmail) {
      return res.status(400).json({ message: "Invalid input / missing fields" });
    }

    const user = await User.findOne({ email: subscriberEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const video = await VideoSchema.findOne({ videoUrl });
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const userId = user._id;

    const alreadyLiked = video.likes.some(l => l.user.equals(userId));

    //  REMOVE LIKE
    if (alreadyLiked) {
      await VideoSchema.findByIdAndUpdate(
        video._id,
        { $pull: { likes: { user: userId } } },
        { new: true }
      );

      return res.status(200).json({ message: "Like removed", liked: false });
    }

    //  ADD LIKE + REMOVE DISLIKE
    await VideoSchema.findByIdAndUpdate(
      video._id,
      {
        $addToSet: { likes: { user: userId } },
        $pull: { dislikes: { user: userId } }
      },
      { new: true }
    );

    return res.status(200).json({ message: "Video liked", liked: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});





module.exports = router