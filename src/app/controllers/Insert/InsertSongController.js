
const {mutipleMongooseToObject} = require('../../../util/mongoose');
const {getHost} = require('../../../util/getHost');

const Song = require('../../models/Song');
const Category = require('../../models/Category');
const Singer = require('../../models/Singer');
const Playlist = require('../../models/Playlist');
const Album = require('../../models/Album');

class InsertSongController {

    // [GET] / 
    index(req, res) {
       res.json({error: true, message: 'Notthing Happened hihihi!!!!'});
    }

    // [GET] /insertSong 
    async insertSong(req, res) {
        if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
        const categories = await Category.find({});
        const singers = await Singer.find({});
        const playlists = await Playlist.find({});
        const albums = await Album.find({});

        res.render('insertlayouts/InsertSong',{
            categories: mutipleMongooseToObject(categories),
            singers: mutipleMongooseToObject(singers),
            playlists: mutipleMongooseToObject(playlists),
            albums: mutipleMongooseToObject(albums)
        });
    }

    // [POST] /insertSongPost 
    async insertSongPost(req, res){
        try {
            console.log('path: ' + req.files[0].filename);
            const categories = await Category.find({_id: {$in: req.body.categoryId}});
            const singers = await Singer.find({_id: {$in: req.body.singerId}});
            // const playlists = await Playlist.find({_id: {$in: req.body.categoryId}}, '_id');

            req.body.category = categories;
            req.body.singer = singers;
            req.body.playlistid = req.body.playlistId;
            req.body.albumid = req.body.albumId;
            req.body.image = req.protocol + '://' + getHost(req) + '/image/imageSong/' + req.files[0].filename;
            // req.body.image = req.protocol + '://' + req.headers.host + '/image/imageSong/' + req.files[0].filename;
            // req.body.link = req.protocol + '://' + req.headers.host + '/streamsong/' + req.files[1].filename;
            req.body.link = req.protocol + '://' + getHost(req) + '/streamsong/' + req.files[1].filename;

            const song = new Song(req.body);
            song.save()
                .then(() => {
                        res.json({ error: false, message : 'Thêm bài hát thành công!!!'});
                    })
                .catch(function(err){
                    res.json({error: true, message: 'thêm bài hát thất bại', error_message: err.message});
                });  
        } catch (error) {
            res.redirect('/insert/insertSong');
            console.log(error.message);
        }
        
    }
}

module.exports = new InsertSongController;