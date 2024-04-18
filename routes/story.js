const mongoose = require('mongoose');

const storySchema = mongoose.Schema({
picture: String,
date: {
    type: Date,
    default: Date.now
},
time : Number,
user: {
    type: mongoose.Schema.Types.ObjectId,
    ref : 'user',
},
caption: String,
})

module.exports = mongoose.model('story',storySchema)