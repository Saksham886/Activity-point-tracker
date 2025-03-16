const express=require('express');
const app=express();
const mongoose=require('mongoose');
const flash=require('connect-flash');
require('dotenv').config(); // Load environment variables from .env file
// require schema
const Listing=require('./models/listings');
// for ejs
const path=require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
// to get the data from url
app.use(express.urlencoded({extended:true}));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// to use post as put method
const methodOverride=require("method-override");
app.use(methodOverride("_method"));
// ejs-mate
const ejsmate=require("ejs-mate");
app.engine("ejs",ejsmate);
// to use static file it should be save in public folder only
app.use(express.static(path.join(__dirname,"public")));
// express session 
const MongoStore = require('connect-mongo');
const session=require("express-session");
const upload = require('./config/multer');

// passport
const User = require('./models/user.js'); 
const User_proctor = require('./models/user_proctor.js'); 
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const wrapAsync = require("./public/util/WrapAsync.js");
// Connection to DB
const MONGO_URL=process.env.MONGO;
// Error Handling
main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=> {
    console.log(err)});
// main fxn to connect to DB
async function main() {
    await mongoose.connect(MONGO_URL);
}
// Session for cookies
const store= MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: {
      secret: process.env.SECRET,
    },
    touchAfter: 1*3600,
  
})
store.on("error",()=>{
  console.log("Error in Mongosession store",error);
});
const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized: true,
    Cookie:{
        expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
        
    },
};
app.use(session(sessionOptions));
app.use(flash());
app.use(express.json()); 
app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  next();
})
// passport setup
app.use(passport.initialize());
app.use(passport.session());


// Define Strategies
passport.use('user-local', new localStrategy(User.authenticate()));
passport.use('proctor-local', new localStrategy(User_proctor.authenticate()));

// Serialize User (include role information)
passport.serializeUser((user, done) => {
  const role = user instanceof User ? 'user' : 'proctor';
  done(null, { id: user.id, role });
});

// Deserialize User (based on role)
passport.deserializeUser(async (data, done) => {
  try {
    const Model = data.role === 'user' ? User : User_proctor;
    const user = await Model.findById(data.id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
// email_sent
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    secure:true,
    host: 'smtp.gmail.com',
    port:465,
    

    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });
  

// Define a function to send an email
const sendNotification = (toEmail, message) => {
  const mailOptions = {
    from: process.env.EMAIL,   // Sender email
    to: toEmail,               // Receiver email
    subject: 'Activity point claimed',          // Email subject
    text: message              // Email body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};



// signup_student
app.post("/signup", wrapAsync(async (req, res, next) => {
  try {
      let { username, usn, email, proctor_name, proctor_email, password } = req.body;
      const newUser = new User({ username, usn, email, proctor_name, proctor_email, pointearned: 0 });

      const registeredUser = await User.register(newUser, password);
      console.log(registeredUser);

      req.flash("success", "Your account has been created successfully!");
      res.redirect("/dashboard");
  } catch (err) {
      if (err.name === "UserExistsError") {
          req.flash("error", "Username already exists. Please choose another.");
      } else {
          req.flash("error", "Something went wrong. Please try again.");
      }
      res.redirect("/signup");
  }
}));


// login student
app.post("/login",passport.authenticate('user-local',
    { failureRedirect: '/student_login',failureFlash:true }),async(req,res)=>{
        req.flash("success","Login successful!");
        res.redirect("/dashboard");
})
// home
app.get('/',(req,res)=>{
    res.render("../views/listings/home/home1.ejs");
})
app.get('/login_as',(req,res)=>{
    res.render("../views/listings/home/login_as.ejs");
})
app.get('/signup_as',(req,res)=>{
    res.render("../views/listings/home/signup_as.ejs");
})
app.get('/student_login',(req,res)=>{
    res.render("../views/listings/home/studentlogin.ejs");
})
app.get('/proctor_login',(req,res)=>{
    res.render("../views/listings/home/proctorlogin.ejs");
})
app.get('/proctor_signup',(req,res)=>{
    res.render("../views/listings/home/proctorsignup.ejs");
})
app.get('/student_signup',(req,res)=>{
    res.render("../views/listings/home/studentsignup.ejs");
})

app.get('/logout',(req, res, next)=>{
    req.logout((err)=> {
      if (err) { return next(err); }
      req.flash("success","You have safely logged out.");
      res.redirect('/');
    });
  });

//proctor

// signup_proctor
app.post("/proctor_signup", wrapAsync(async (req, res) => {
  try {
      let { username, email, password } = req.body;
      const newUser = new User_proctor({ username, email });

      const proctor_user = await User_proctor.register(newUser, password);
      console.log(proctor_user);

      req.flash("success", "Your account has been created successfully!");
      res.redirect("/proctor_login");
  } catch (err) {
      if (err.name === "UserExistsError") {
          req.flash("error", "Username already exists. Please choose another.");
      } else {
          req.flash("error", "Something went wrong. Please try again.");
      }
      res.redirect("/proctor_signup");
  }
}));



// login proctor
app.post("/proctor_login",passport.authenticate('proctor-local',
    { failureRedirect: '/proctor_login' , failureFlash:true}),async(req,res)=>{
      req.flash("success","Login successful!"); 
      res.redirect("/proctor");

})
// proctor logout
app.get('/proctor_logout',(req, res, next)=>{
    req.logout((err)=> {
      if (err) { return next(err); }
      req.flash("success","You have safely logged out.");
      res.redirect('/');
    });
  });

app.get('/proctees',async(req,res)=>{
  if (!req.isAuthenticated()) {
    req.flash("error","Please Login");
    return res.redirect("/proctor_login");;
}
  const useremail = req.user.email;
  const users=await User.find({})
  const alllistings = await Listing.find({});
    res.render("../views/proctor/allstudent.ejs",{users,alllistings,useremail});
})
app.get('/proctor',async(req,res)=>{
  if (!req.isAuthenticated()) {
    req.flash("error","Please Login");
    return res.redirect("/proctor_login");
}

    const username=req.user.username;
    const useremail = req.user.email;
    const alllistings = await Listing.find({ }).populate("owner");
    
    res.render("../views/proctor/home.ejs",{alllistings,useremail,username});
})
app.post('/verify-listing', async (req, res) => {
    const { id, status } = req.body;
      await Listing.findByIdAndUpdate(id, { verify: status });
      res.json({ success: true });
  });
  
  app.get('/proctor/:id', async (req, res) => {
    let {id} = req.params;
    const alllistings = await Listing.find({}).populate("owner");
    res.render("../views/proctor/ver.ejs",{alllistings,id});
  })
  app.get('/proctees/:id', async (req, res) => {
    let {id} = req.params;
    const alllistings = await Listing.find({}).populate("owner");
    const users= await User.find({});
    res.render("../views/proctor/studentdetails.ejs",{alllistings,id,users});
  })


// index route
app.get('/dashboard', async (req, res) => {
  if (!req.isAuthenticated()) {
      req.flash("success","Please Login");
      return res.render("../views/listings/home/studentlogin.ejs");
  }  
      const username = req.user.username;
      const curruser = req.user._id;

      // Fetch all listings
      const alllistings = await Listing.find({});

      // Calculate `pointearned` for the current user
      const pointearned = alllistings
          .filter(list => list.owner.equals(curruser) && list.verify === 1)
          .reduce((sum, list) => sum + list.points, 0);

      // Update `pointearned` in the database for the current user
      await User.findByIdAndUpdate(curruser, { pointearned });

      // Render the dashboard with updated data
      res.render("../views/listings/index.ejs", { alllistings, username, curruser, pointearned });
  
});

// new route
app.get('/dashboard/new',async (req,res)=>{
    res.render("../views/listings/new.ejs");
})
// all activity
app.get('/dashboard/allactivity',async (req,res)=>{
  const curruser = req.user._id;
  const totalPoints=req.user.pointearned;
  const alllistings = await Listing.find({});
  const activities=alllistings.filter(list => list.owner.equals(curruser))
  res.render("../views/listings/allactivity.ejs",{activities,totalPoints});
})
// show route
app.get('/dashboard/:id',async(req,res)=>{
    let {id}=req.params;
    const list= await Listing.findById(id);
    res.render("../views/listings/show.ejs",{list});
})

// post
app.post('/dashboard', upload, async (req, res) => {
  try {
      const { activity, date, description, points } = req.body.listing;
      const proctor_mail = req.user.proctor_email;

      // Create a new activity listing
      const newActivity = new Listing({
          activity,
          date,
          description,
          points,
          verify: -1, // Initial verification status
          owner: req.user._id,
          certificate: {
              url: `/uploads/${req.file.filename}`,  // Store the file path in the database
              filename: req.file.filename  // Store the file name
          }
      });

      // Send notification to the proctor
      const message = `Student's Name: ${req.user.username}
Activity: ${newActivity.activity}
Points Claimed: ${newActivity.points}
Date: ${new Date(newActivity.date).toLocaleDateString()}
Details:
${newActivity.description}`;

      sendNotification(proctor_mail, message);

      // Save the new activity
      await newActivity.save();

      // Flash success message
      req.flash('success', 'Activity successfully added!');
      res.redirect('/dashboard');

  } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to add activity. Please try again.');
      res.redirect('/dashboard/new');
  }
});



// delete route
app.delete('/dashboard/:id', async (req, res) => {
  try {
      let { id } = req.params;
      let deleted = await Listing.findByIdAndDelete(id);
      if (!deleted) {
          req.flash('error', 'Activity not found.');
      } else {
          req.flash('success', 'Activity successfully deleted.');
      }
      res.redirect('/dashboard');
  } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to delete activity. Please try again.');
      res.redirect(`/dashboard/${id}`);
  }
});
app.listen(8080,()=>{
    console.log("app is listening");
});
