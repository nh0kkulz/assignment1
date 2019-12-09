const adminAccess = (req,res,next)=>
{
    if(req.session.adminInfo==null)
    {
        res.redirect("/user/profile");
    }
    else{
        next();
    }
}

module.exports=adminAccess;