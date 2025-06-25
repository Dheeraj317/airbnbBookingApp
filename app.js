const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listings.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAcync = require("./utils/wrapAcync.js");
const ExpressError = require("./utils/expressError.js");
const {listingSchema} = require("./schema.js");


app.set("views engine" , "ejs");
app.set("views" , path.join(__dirname ,"/views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
.then(res =>{
    console.log("server on connected to DB");
}).catch(err =>{
    console.log(err);
});

const validateListing = (req, res, next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message.join(","));
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}
//index routes

app.get("/listings", wrapAcync(async(req,res, next)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//new routes
app.get("/listings/new", (req,res)=>{
    res.render("listings/new.ejs");
});


//show routes
app.get("/listings/:id" , wrapAcync(async(req,res, next)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
}));

//add route

app.post("/listings",validateListing, wrapAcync(async(req,res,next)=>{
    
    //const {title,description,image,price,location,country} = req.body;
    const listing = req.body.listing;
    if(!listing.image){
        listing.image = undefined;
    }
    const newListing = new Listing(listing);
    await newListing.save();
    console.log(newListing);
    res.redirect("/listings"); 
    
}))
//edit routes
app.get("/listings/:id/edit", wrapAcync(async(req,res,next)=>{
   let {id} = req.params;
   const listing = await Listing.findById(id);
   res.render("listings/edit.ejs", {listing});
   
}));
//update routes
app.put("/listings/:id", validateListing, wrapAcync(async(req,res, next)=>{
    let {id} = req.params;
    const updatedListing = req.body.listing;
    await Listing.findByIdAndUpdate(id, {...updatedListing});
    res.redirect(`/listings/${id}`);
   
}));

//destroy route
app.delete("/listings/:id", wrapAcync(async(req,res, next)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
    
}));

// app.get("/testListing", async(req,res)=>{
//     const testlisting = new Listing({
//         title: "Amazing Beach House",
//         description: "A beautiful house with sea views.",
//         price: 200000,
//         location: "Goa",
//         country: "India"    
//     })
//    const listings = await testlisting.save();
//    console.log("data save");
//    res.send("working");
// });


app.get("/", (req, res)=>{
    res.send("working");
});


app.use((err, req, res, next)=>{
    let {status=500, message="something went wrong"} = err;
    res.status(status).render("listings/error.ejs",{message});
});

app.listen(8080, ()=>{
    console.log("app was listening on port 8080");
});
