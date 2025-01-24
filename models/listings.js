const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingschema = new Schema({
  activity: {
    type: String,
    required: true
  },
  date: Date,
  description: String,
  certificate: {
    url: String,
    filename: String
  },
  points: Number,
  verify: Number,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
});

const Listing = mongoose.model('Listing', listingschema);
module.exports = Listing;
