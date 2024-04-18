const mongoose = require('mongoose');
const { array } = require('./multer');


const postSchema = mongoose.Schema({
    picture: String,
    user: {type: mongoose.Schema.Types.ObjectId , ref: 'user'},
    caption: String,
    date: {type: Date, default: Date.now()},
    likes:[{type: mongoose.Schema.Types.ObjectId , ref: 'user'}],
    comments: {type: Array, default:[]},
    shares: {type: Array, default:[]},
})

module.exports = mongoose.model('post', postSchema);    