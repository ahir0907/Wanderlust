if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const expressError = require("../MAJORPROJECT/utils/expressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../MAJORPROJECT/models/user.js");

const listingRouter = require("../MAJORPROJECT/routes/listing.js");
const reviewRouter = require("../MAJORPROJECT/routes/review.js");
const userRouter = require("../MAJORPROJECT/routes/user.js");


// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main().then(() =>{
    console.log("conected to DB");
}).catch((err)  => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: "mysuperkeys",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

// app.get("/", (req,res) =>{
//     res.send("Hi, I am root");
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
 
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.get("/userdemo", async(req, res) => {
    let fakeUser = new User({
        email: "kalpesh@gmail.com",
        username: "kalpesh-hadiya",
    });
    let registeredUser = await User.register(fakeUser, "kalpesh@123");
    res.send(registeredUser);
})


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);



app.all("*", (req, res, next) => {
    next(new expressError(404, "page not found!"));
});

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "something went wrong!"} = err;
    res.status(statusCode).render("../views/error.ejs", {message});
    // res.status(statusCode).send(message);
});

app.listen(8080, () =>{
    console.log("server is listening in port 8080");
});
