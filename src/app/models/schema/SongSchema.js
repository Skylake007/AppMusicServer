const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Category = require('./CategorySchema');
const Singer = require('./SingerSchema');

const Song = new Schema({
    image: String,
    link: String,
    // title: {type: String, text: true},
    title : String,
    category: [Category],
    singer: [Singer],
    playlistid: [String],
    albumid: [String],
    // lyric: {type: String, text: true}
    lyric: String
}, 
    {
        versionKey: false,
        timestamps: true
    }
);

// Song.index({title : 'text', lyric : 'text'}); // create index for searching/
// Singer.index({singername: 'text'});

module.exports = Song;