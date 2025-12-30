const express = require('express')
const dotenv = require('dotenv')
const { User, VideoSchema } = require('../db.model')


const router = express.Router()
dotenv.config()


//get subscriber details from client




router.post("/subscribe", async (req, res) => {
  try {
    const { videoUrl, subscriberEmail, sub } = req.body;


    if (!videoUrl || !subscriberEmail) {
      return res.status(400).json({ message: "Invalid input / missing fields" });
    }

    // find subscriber
    const subscriber = await User.findOne({ email: subscriberEmail });
    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found", subscribe: false });
    }

    // find channel (video owner)
    const video = await VideoSchema.findOne({ videoUrl });
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const channelId = video.user; // channel owner ID

    // check already subscribed
    const isSubscribed = subscriber.subscribedChannels.some(id =>
      id.equals(channelId)
    );


    //  UNSUBSCRIBE
    if (isSubscribed && sub) {
      await User.findByIdAndUpdate(
        channelId,
        { $inc: { subscribersCount: -1 } },
        { new: true }
      );

      await User.findByIdAndUpdate(
        subscriber._id,
        { $pull: { subscribedChannels: channelId } },
        { new: true }
      );

      return res.status(200).json({
        message: "Unsubscribed successfully",
        subscribe: false
      });
    }
    if (!isSubscribed && sub) {


      //  SUBSCRIBE
      await User.findByIdAndUpdate(
        channelId,
        { $inc: { subscribersCount: 1 } },
        { new: true }
      );

      await User.findByIdAndUpdate(
        subscriber._id,
        { $addToSet: { subscribedChannels: channelId } },
        { new: true }
      );

      return res.status(200).json({
        message: "Subscribed successfully",
        subscribe: true
      });
    }

    if (isSubscribed) {
      return res.status(200).json({ message: "already subcribed", subscribe: true });
    }
    return res.status(200).json({ message: "Not subcribed", subscribe: false });


  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});




//check sub true or false 






module.exports = router

