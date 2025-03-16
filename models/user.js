const mongoose=require("mongoose");
const schema=mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userschema =new schema({
    name:{
        type:String,
        required: true,
    }, email:{
        type :String,
        required: true
    }, proctor_name:{
        type :String,
        required: true
    }, proctor_email:{
        type :String,
        required: true
    },pointearned: { type: Number, default: 0 },
    // passport local mongoose will auto generate user name and hashed password 
    // therefore we need not to write in schema
});
userschema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",userschema);