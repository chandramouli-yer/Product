const express = require('express')
const app = express()
const cors = require('cors')
const passport = require('passport')
const path = require('path')
const cookieSession = require('cookie-session')
const User = require('./models/user');
const dbConnect=require('./dbConnect.js')
require('./passport-setup');
require('dotenv').config();
let newUser={}
app.use(cors());
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "http://localhost:2000/"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });
app.use(express.json());


app.use(cookieSession({
    name: 'product-login-session',
    keys: ['key1', 'key2']
}))

const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}


app.use(passport.initialize());
app.use(passport.session());

app.get("/",(req,res)=>{
    res.send("Welcome to the Product")
})
app.get('/failed', (req, res) => res.send('You Failed to log in'))


app.get('/loggedin', isLoggedIn, (req, res) => {
   const loginSource=req.user.provider;
    if(loginSource=="github"){
        console.log("inside git")
        newUser={
            "username": (req.user.username),
                "EmailID": (req.user.emails[0].value),
                "ProfilePic": (req.user._json.avatar_url),
                "UserID": (req.user._json.id),
                "CreatedAt": new Date(),
                "UpdatedAt": new Date(),
                "IsBlocked":false,
                "BlockedAt":null
        }

    } else if(loginSource==="google"){
         newUser={
            "username": JSON.stringify(req.user._json.name),
                "EmailID": JSON.stringify(req.user._json.email),
                "ProfilePic": JSON.stringify(req.user._json.picture),
                "UserID": JSON.stringify(req.user.id),
                "CreatedAt": new Date(),
                "UpdatedAt": new Date(),
                "IsBlocked":false,
                "BlockedAt":null
        }
    }
    else{
        
        res.status(401).json({message:"Invalid Authentications source"})
    }
    User.find({ EmailID: newUser.EmailID }, function (err, existingUser) {
        if(err){
            res.status(401).json({message:err});
        }
        else if (existingUser.length === 1&&!existingUser[0].IsBlocked) {
            console.log(existingUser[0].IsBlocked)
            res.status(200).json({message:"Welcome back",User:existingUser});
        }
        else if((existingUser.length === 1)&&(existingUser[0].IsBlocked)){
            res.status(401).json({message:"OOPS!!Your access is blocked to this product.Kindly write to codechandra@gmail.com to get access",data:existingUser})
        }
        else {
            const run = async () => {
                const user = new User(newUser)

                try {
                    const saved_user = await user.save();
                    res.json({ status: true, message: "Registered successfully.", data: saved_user });
                } catch (error) {
                    res.status(400).json({ status: false, message: "Something went wrong.", data: error.message });
                }
            }
            run()
        }

    })
})

app.get('/login/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/login/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
    async function (req, res) {
        req.body.authSource="GOOGLE";
        res.redirect('/loggedin');
    }
);


app.get('/login/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/login/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
      req.body.authSource="GITHUB"
    res.redirect('/loggedin');
  });



app.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
})

const main=async ()=>{
    app.listen(process.env.PORT, () => console.log(`Server started listening on port ${process.env.PORT}!`))
    await dbConnect.connectToMongoDB();
}

main();
