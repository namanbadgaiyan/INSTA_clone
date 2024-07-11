const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/newInstaDB");

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  name: String,
  password: String,
  profileImg: {
    type: String,
    default: 'OIP.jpeg',
  },
  bio: String,
  posts: [{type: mongoose.Schema.Types.ObjectId , ref: 'post'}],
  followers: [{type: mongoose.Schema.Types.ObjectId , ref: 'user'}],
  following: [{type: mongoose.Schema.Types.ObjectId , ref: 'user'}],
  stories: [{type: mongoose.Schema.Types.ObjectId , ref: 'story'}],
  saved: [{type: mongoose.Schema.Types.ObjectId , ref: 'post'}],
})

userSchema.plugin(plm);
module.exports = mongoose.model('user', userSchema);