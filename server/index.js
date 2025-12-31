const express = require("express")
const cors = require("cors")
const dotenv = require('dotenv')
const MongoStore = require("connect-mongo").default



// requireing for google authentication
const passport = require('passport')
const session = require('express-session')
const userRouter = require('./src/controllers/google.auth.controller.js')
const uploadRouter = require('./src/controllers/videoupload.js')
const videoRouter = require('./src/controllers/videos.js')
const subscribeRouter = require('./src/controllers/subscribe.js')
const likeRouter = require('./src/controllers/like.js')
const dislikeRouter = require('./src/controllers/dislike.js')
const commantRouter = require('./src/controllers/commant.js')
const videoRecordsRouter = require('./src/controllers/videorecords.js')
const viewsRouter = require('./src/controllers/views.js')
const cmtRec = require('./src/controllers/cmtlike.js')











const { Youtube, User } = require('./src/db.model.js')
const connectDB = require("./src/lib.js")

const app = express()

dotenv.config() //Environmental variable config
app.use(express.json())
connectDB() // connecting to data base
app.use(express.urlencoded({ extended: true }))  // to parse url encoded data
app.use(cors({   // cross origin resource sharing

    origin: process.env.FRONTEND_PAGE_LINK, // frontend URL
    methods: ["POST", "GET"],
    credentials: true  // What kind of methods when we will use
}))








//app.post('/uservideos',userVideos) // getting user videos


app.post('/api/test', async (req, res) => {
    const { name, email, password, video } = req.body;
    try {
        const newUser = new User({
            name: name,
            email: email,
            password: password,
            videos: [video]
        })
        await newUser.save()
        res.json({ success: true, message: "user created successfully" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message })
    }
})// test API to check videos in DB


app.set("trust proxy", 1)

//user login api 
// session middleware configuration with cookie settings and security options
app.use(session
    ({
        name: 'Google-Auth-Session',
        secret: process.env.SESSION_SECRET,
        resave: false,  // do not save session if unmodified
        saveUninitialized: false, 
        store: MongoStore.create({
        mongoUrl: process.env.DB_URL,
        collectionName: 'sessions',
        ttl: 30 * 24 * 60 * 60 
  }),// do not create session until something stored
        cookie: {
            maxAge: 30 * 24 * 60 * 60  // cookie expiry time of 1 day
            httpOnly: true,  // cookie not accessible via client side scripts
            secure: true,  // cookie sent over http only inproduction set it to true
            sameSite: 'None'  // CSRF protection
        }
    }))






// middleware 


app.use('/', userRouter) // using user router for google authentication routes
app.use('/', uploadRouter)
app.use('/', videoRouter)
app.use('/', subscribeRouter)
app.use('/', likeRouter)
app.use('/', dislikeRouter)
app.use('/', commantRouter)
app.use('/api', videoRecordsRouter)
app.use('/api', viewsRouter)
app.use('/api', cmtRec)











app.listen(8000, () => {  // crating a  server running at port of 8000
    console.log("server is running at port 8000")

})
