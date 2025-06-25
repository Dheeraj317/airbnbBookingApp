
const mongoose = require("mongoose");
const sampleData = require("./data.js");
const Listing = require("../models/listings.js");

mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
.then(res =>{
    console.log("server on connected to DB");
}).catch(err =>{
    console.log(err);
});


const initDB = async()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(sampleData.data);
    console.log("data was save");
};

initDB();