/*********************Room ROUTES***************************/
const express = require('express')
const router = express.Router();
const Room = require("../models/Room");
const hasAccess = require("../middleware/auth");
const adminAccess = require("../middleware/admin");
const path = require("path");
//Route to direct use to Create Room form
router.get("/add", adminAccess, (req, res) => {
    res.render("Room/roomAddForm")
});
//Route to process user's request and data when the user submits the add room form
router.post("/add", hasAccess, (req, res) => {
    //validation
    const newRoom = {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        location: req.body.location,
        userId: req.session.userInfo._id
    }
    const errors = [];
    //Test to see if user did not upload file
    if (req.files == null) {
        errors.push("Sorry you must upload an image")
    }
    //User uploaded image
    else {       //file is not an image
        if (req.files.profilePic.mimetype.indexOf("image") == -1) {
            errors.push("Sorry you can only upload images : Example (jpg,gif, png) ")
        }
    }
    //Has errors
    if (errors.length > 0) {
        res.render("Room/roomAddForm", {
            message: errors,
            title: newRoom.title,
            description: newRoom.description,
            price: newRoom.price,
            location: newRoom.location
        })
    }
    else {
        const room = new Room(newRoom);
        room.save()
            .then(room => {
                //rename file
                req.files.profilePic.name = `db_${room._id}${path.parse(req.files.profilePic.name).ext}`
                //upload file to server
                req.files.profilePic.mv(`public/upload/${req.files.profilePic.name}`)
                    .then(() => {
                        //Then is needed to refer to associate the uploaded image to the room
                        Room.findByIdAndUpdate(room._id, {
                            profilePic: req.files.profilePic.name
                        })
                            .then(() => {
                                console.log(`File name was updated in the database`)
                                res.redirect("/room/roomlisting");
                            })
                            .catch(err => console.log(`Error :${err}`));
                    });
            })
            .catch(err => console.log(`Error :${err}`));
    }
});
router.get("/roomlisting", (req, res) => {
    Room.find()
        .then((rooms) => {
            res.render("Room/roomlisting",
                {
                    room: rooms
                });
        })
        .catch(err => console.log(`Error : ${err}`));
})
router.get("/list", adminAccess, (req, res) => {
    Room.find({ userId: req.session.adminInfo._id })
        .then((rooms) => {
            res.render("Room/list",
                {
                    room: rooms
                });
        })
        .catch(err => console.log(`Error : ${err}`));
});
router.get("/edit/:id", adminAccess, (req, res) => {
    Room.findById(req.params.id)
        .then((room) => {

            res.render("Room/roomEditForm", {
                roomDocument: room
            })

        })
        .catch(err => console.log(`Error : ${err}`));
});
router.put("/edit/:id", adminAccess, (req, res) => {
    Room.findById(req.params.id)
        .then((room) => {
            room.title = req.body.title;
            room.description = req.body.description;
            room.price = req.body.price;
            room.location = req.body.location;
            room.save()
                .then(room => {
                    //rename file
                    req.files.profilePic.name = `db_${room._id}${path.parse(req.files.profilePic.name).ext}`
                    //upload file to server
                    req.files.profilePic.mv(`public/upload/${req.files.profilePic.name}`)
                        .then(() => {
                            //Then is needed to refer to associate the uploaded image to the room
                            Room.findByIdAndUpdate(room._id, {
                                profilePic: req.files.profilePic.name
                            })
                                .then(() => {
                                    console.log(`File name was updated in the database`)
                                    res.redirect("/room/roomlisting");
                                })
                                .catch(err => console.log(`Error :${err}`));
                        });
                })
                .catch(err => console.log(`Error :${err}`));

        })
        .catch(err => console.log(`Error : ${err}`));
});
//Route used to delete room 
router.delete("/delete/:id",adminAccess,(req,res)=>
{
    Room.deleteOne({_id:req.params.id})
    .then((room)=>{

        res.redirect("/room/list");
    })
    .catch(err=>console.log(`Error : ${err}`));
});
router.post("/search", (req,res)=>{
    Room.find({location:req.body.locations})
        .then((rooms) => {
            res.render("Room/searchRoom",
                {
                    room: rooms
                });
        })
        .catch(err => console.log(`Error : ${err}`));
})
module.exports = router;