const mongoose = require('mongoose')
const Youtube = require('./db.model.js')

module.exports = async function connectDB(){
    await mongoose.connect(process.env.DB_URL)
    
    .then( ()=>{
        console.log("DATA BASE CONNECTED SUCCESSFULLY")
    })
    .catch((err)=>{
        console.log(`Dta base connection error${err}`) 
        
    }) 
} 

 