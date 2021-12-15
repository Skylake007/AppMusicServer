
const {mutipleMongooseToObject} = require('../../../util/mongoose');
const {getHost} = require('../../../util/getHost');

const Playlist = require('../../models/Playlist');
const Category = require('../../models/Category');

class InsertPlaylistController {

    // [GET] / 
    index(req, res) {
       res.json({error: true, message: 'Notthing Happened hihihi!!!!'});
    }

    // [GET] /insertPlaylist 
    insertPlaylist(req, res) {
        if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
        Category.find({})
            .then(categories => res.render('insertlayouts/InsertPlaylist',{ 
                categories: mutipleMongooseToObject(categories)
            }))
            .catch(function(err){
                res.json({error: true, message: err.message});
            });
    }

    // [POST] /insertPlaylistPost 
    insertPlaylistPost(req, res){
        console.log('req.body.categoryId : ' + req.body.categoryId);
        req.body.image = req.protocol + '://' + getHost(req) + '/image/imageplaylist/' + req.file.filename;
        // req.body.image = req.protocol + '://' + req.headers.host + '/image/imageplaylist/' + req.file.filename;
        Category.findOne({_id: req.body.categoryId}, function (err, category) {
            req.body.category = category; 
            const playlist = new Playlist(req.body);
            playlist.save()
                .then(function(){
                    res.json( {status : 'Thêm Playlist thành công!!!'})
                })
                .catch(function(err){
                    res.json({ status: 'Thêm Playlist thất bại\n ', error_message: err.message })
                })       
        })
            
    }
}

module.exports = new InsertPlaylistController;