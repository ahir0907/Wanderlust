const User = require("../models/user");

module.exports.renderSingupForm = (req, res) => {
    res.render("../views/users/singup.ejs");
};

module.exports.singup = async(req,res) => {
    try{
        let { username, password, email} = req.body;
    const newUser = new User({email, username});
    const registeredUser =  await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "welcome to wanderlust");
        res.redirect("/listings");
    });
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/singup");
    }
};

module.exports.renderLoginForm =(req, res) => {
    res.render("../views/users/login.ejs");
};

module.exports.login = async(req, res) => {
    req.flash("success","welcome to wanderlust! You are login");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logOut((err) => {
        if(err) {
            next(err);
        }
        req.flash("success", "you are logout!");
        res.redirect("/listings");
    });
};