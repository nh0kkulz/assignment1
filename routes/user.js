/*********************USER ROUTES***************************/
const express = require('express')
const router = express.Router();
const bcrypt = require("bcryptjs");

//This allows you to pefrom CRUD operations on the User colections 
const User = require("../models/User");
//Route to direct use to Registration form
router.get("/registration", (req, res) => {
    res.render("User/registration");
});
//Route to process user's request and data when user submits registration form
router.post("/registration", (req, res) => {
    const errors = [];
    const regexp = /^[a-zA-Z0-9]{6,12}$/;
    if (req.body.email == "") {
        errors.push("Please enter an email");
    }
    if (req.body.firstname == "") {
        errors.push("Please enter your first name")
    }
    if (req.body.lastname == "") {
        errors.push("Please enter your last name")
    }
    if (req.body.birthday == "") {
        errors.push("Please enter your birthday")
    }
    if (regexp.test(req.body.password) == false) {
        errors.push("Must enter a password that is 6 to 12 characters and the password must have letters and numbers only")
    }
    if (req.body.confirm != req.body.password) {
        errors.push("Sorry, your password does not match")
    }
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (user != null) {
                errors.push("This email is already used");
            }
            //Has errors
            if (errors.length > 0) {
                res.render("User/registration",
                    {
                        message: errors
                    })
            } else {
                const newUser = {
                    email: req.body.email,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    password: req.body.password,
                    dob: req.body.birthday
                }
                const nuser = new User(newUser);
                nuser.save()
                    .then(() => {
                        console.log('User was inserted into database')
                    })
                    .catch((err) => {
                        console.log(`User was not inserted into the database because ${err}`)
                    })

                const nodemailer = require('nodemailer');
                const sgTransport = require('nodemailer-sendgrid-transport');
                var options = {
                    auth: {
                        api_key: process.env.APIKEY
                    }
                }
                const mailer = nodemailer.createTransport(sgTransport(options));
                const email = {
                    to: `${req.body.email}`,
                    from: 'trumhentaidenhat@gmail.com',
                    subject: 'Confirmation Email',
                    text: `Your account was created`,
                    html: `<strong>Your account was created</strong>`
                };
                mailer.sendMail(email, (err, res) => {
                    if (err) {
                        console.log(err)
                    }
                    console.log(res);
                });
                res.redirect("/user/confirmation");
            }
        })

        .catch(err => console.log(`Something occured ${err}`));
});
//Route to direct user to login form
router.get("/login", (req, res) => {
    res.render("User/login");
});
//Route to process user's request and data when user submits login form
router.post("/login", (req, res) => {
    const errors = [];
    if (req.body.email == "") {
        errors.push("Please enter your email");
    }
    if (req.body.password == "") {
        errors.push("Please enter your password");
    }
    const formData = {
        email: req.body.email,
        password: req.body.password
    }
    User.findOne({ email: formData.email })
        .then(user => {
            //This means that there was no matching email in the database
            if (user == null) {
                if (errors.length == 0)
                    errors.push("Sorry your email was not found");
                res.render("User/login", {
                    message: errors
                })
            }

            //This reprsents tha the email exists
            else {
                bcrypt.compare(formData.password, user.password)
                    .then(isMatched => {

                        if (isMatched == true) {
                            //It means that the user is authenticated 

                            //Create session 
                            req.session.userInfo = user;
                            if (user.type == 'User')
                                res.redirect("/user/profile")
                            if (user.type == 'Admin') {
                                req.session.adminInfo = user;
                                res.redirect("/user/adminprofile")
                            }
                        }
                        else {
                            errors.push("Sorry, your password does not match");
                            res.render("User/login", {
                                message: errors
                            })
                        }

                    })
                    .catch(err => console.log(`Error :${err}`));
            }
        })
        .catch(err => console.log(`Something occured ${err}`));
});
router.get("/logout", (req, res) => {

    //This destorys the session
    req.session.destroy();
    res.redirect("/user/login");
});
//Route the user to their dashboard 
router.get("/profile", (req, res) => {
    res.render("User/userDashboard");
});
router.get("/adminprofile", (req, res) => {
    res.render("User/adminDashboard");
});
router.get("/confirmation", (req, res) => {
    res.render("User/confirmation");
});
module.exports = router;