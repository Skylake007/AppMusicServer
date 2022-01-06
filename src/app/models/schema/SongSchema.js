const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Category = require('./CategorySchema');
const Singer = require('./SingerSchema');

const Song = new Schema({
    image: String,
    link: String,
    title: {type: String, text: true},
    category: [Category],
    singer: [Singer],
    playlistid: [String],
    albumid: [String],
    lyric: String
}, 
    {
        versionKey: false,
        timestamps: true
    }
);
// Song.index({title: 'text', 'singer.singername': 'text'}); // create index for searching/
module.exports = Song;