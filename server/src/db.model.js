const mongoose = require('mongoose')




// creating schemas

const testShema = new mongoose.Schema(
  {
    videos: [{
      type: String,

    }]
  }
)

const Youtube = mongoose.model('youtube', testShema)



const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  googleId: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  channelName: {
    type: String,
    unique: true    // it makes problem in future because i use default channenamel === emailuser name if any one contain same email username it willl make fault
  },


  channelLogo: {
    type: String, // image URL
    default:
      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  },

  subscribersCount: {
    type: Number,
    default: 0
  },

  subscribedChannels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

}, { timestamps: true })

const User = mongoose.model('user', userSchema)






// //commant shema 
const commentSchema = new mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "video",
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },

  text: {
    type: String,
    required: true
  },

  likesCount: {
    type: Number,
    default: 0
  },

  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "comment",
    default: null
  }

}, { timestamps: true });



const CommentShema = mongoose.model('command', commentSchema)
/// VIDEO SCHEMA


const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    thumbnailUrl: {
      type: String,
      required: true
    },

    videoUrl: {
      type: String,
      required: true
    },

    // OWNER / CHANNEL
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    viewsCount: {
      type: Number,
      default: 0
    },

    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true
        }
      }
    ],

    dislikes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true
        }
      }
    ],

    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public"
    }
  },
  { timestamps: true }
);









 

module.exports = mongoose.model("video", videoSchema)



const VideoSchema = mongoose.model('video', videoSchema)







// watch history shema

const watchHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video"
  },

  watchedAt: {
    type: Date,
    default: Date.now
  }
})


const viewSchema = new mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "video",
    required: true
  },
  ip: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 10 // ⏱ auto delete after 10 minutes
  }
});

const VideoView = mongoose.model("videoview", viewSchema);








const commentReactionSchema = new mongoose.Schema({
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "command",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["like", "dislike"],
    required: true
  }
}, { timestamps: true });

const CommentReactionSchema = mongoose.model("CommentReaction", commentReactionSchema);



module.exports = { Youtube, User, VideoSchema, VideoView, CommentShema, CommentReactionSchema };