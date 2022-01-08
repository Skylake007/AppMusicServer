const mongoose = require('mongoose');
const { createIndexes } = require('../Song');
const Schema = mongoose.Schema;

const Singer = new Schema({
    // singername: { type: String, text: true },
    singername: String,
    image: String 
 }, 
    {
        versionKey: false
    }
);

// Singer.index({singername: 'text'}); // create index for searching
module.exports = Singer;