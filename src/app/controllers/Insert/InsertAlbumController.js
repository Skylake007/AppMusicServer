
const Album = require('../../models/Album');
const Singer = require('../../models/Singer');
const Category = require('../../models/Category');
const {mutipleMongooseToObject} = require('../../../util/mongoose');
const {getHost} = require('../../../util/getHost');
class InsertAlbumController {

    // [GET] insert/insertAlbum 
    async insertAlbum(req, res) {
        try{
            if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
            
            const singers = await Singer.find({});

            if(singers){
                res.render('insertlayouts/InsertAlbum',{ 
                    singers: mutipleMongooseToObject(singers)
                });
            }else {
                res.json({ error: true, message: 'lỗi' });
            }
        }catch(err){
            console.log(err.message);
            res.redirect('/');
        }
    }

    // [POST] insert/insertAlbumPost 
    async insertAlbumPost(req, res){
        console.log('req.file.path: ' + req.file.path);
        console.log('req.file.pathname: ' + req.file.filename);
        console.log('req.body.albumname: ' + req.body.albumname);

        const singer = await Singer.findOne({_id: req.body.singerId});

        req.body.imageAlbum = req.protocol + '://' + getHost(req) + '/image/imagealbum/' + req.file.filename;
        // req.body.imageAlbum = req.protocol + '://' + req.headers.host + '/image/imagealbum/' + req.file.filename;
        req.body.singer = singer;

        console.log(req.body.singer)

        const album = new Album(req.body);
        album.save().then(function(){
            res.json({error: false, message : 'Thêm album thành công!!!'});
            }).catch(function(err){
                res.json({ status: 'Thêm album thất bại\n ', error_message: err.message })
            });   
    }
}

module.exports = new InsertAlbumController;