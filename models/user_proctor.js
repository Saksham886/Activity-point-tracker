const mongoose=require("mongoose");
const schema=mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const User_proctorschema =new schema({
    // id:{
    //     type :String,
    //     required: true
    // }, 
    email:{
        type :String,
        required: true
    }
    // passport local mongoose will auto generate user name and hashed password 
    // therefore we need not to write in schema
});
User_proctorschema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User_proctor",User_proctorschema);