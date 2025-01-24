const mongoose=require("mongoose");
const initdata=require("./data.js");
const Listing=require("../models/listings.js");
main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=> {
    console.log(err)});
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/BMSCE");
}
const initDB= async ()=>{
    await Listing.deleteMany({});
    initdata.data= initdata.data.map((obj)=>({...obj,owner:'6767f11f91539988288676b9',verify:-1}))
    await Listing.insertMany(initdata.data);
    console.log("Data saved in DB")
};
initDB();