const express = require('express')
const dotenv = require('dotenv')
const { User, VideoSchema } = require('../db.model')


const router = express.Router()
dotenv.config()



router.post("/dislike", async (req, res) => {
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

    const alreadyDisliked = video.dislikes.some(d => d.user.equals(userId));

    //  REMOVE DISLIKE
    if (alreadyDisliked) {
      await VideoSchema.findByIdAndUpdate(
        video._id,
        { $pull: { dislikes: { user: userId } } },
        { new: true }
      );

      return res.status(200).json({ message: "Dislike removed", disliked: false });
    }

    //  ADD DISLIKE + REMOVE LIKE
    await VideoSchema.findByIdAndUpdate(
      video._id,
      {
        $addToSet: { dislikes: { user: userId } },
        $pull: { likes: { user: userId } }
      },
      { new: true }
    );

    return res.status(200).json({ message: "Video disliked", disliked: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});




module.exports = router