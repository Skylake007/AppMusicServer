const mongoose = require('mongoose');
const Song = require('../models/Song');
const Category = require('../models/Category');
const Singer = require('../models/Singer');
const Playlist = require('../models/Playlist');
const Album = require('../models/Album');

const {mutipleMongooseToObject} = require('../../util/mongoose');
const {mongooseToObject} = require('../../util/mongoose');
const {removeNewObjectID} = require('../../util/RemoveNewObjectID');
const {getFileName} = require('../../util/getFileNameFromLink');
const {getHost} = require('../../util/getHost');

// delete file
const {deleteSong} = require('../../util/deleteFile');
const {deleteSongImage} = require('../../util/deleteFile');
const {deleteSingerImage} = require('../../util/deleteFile');
const {deletePlaylistImage} = require('../../util/deleteFile');
const {deleteAlbumImage} = require('../../util/deleteFile');
const {deleteCategoryImage} = require('../../util/deleteFile');

class ManageController {
    //===================================================SONG==================================================
    // [GET] /manage/
    listSong(req, res) {
        if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
        else { 
            Song.find({}).exec(function(err, songs) {
                res.render('manage/ManageSong/manageSong', {
                    isLogin: true,
                    songs: mutipleMongooseToObject(songs),
                }); 
            });
        }
    }
    //[GET] /manage/Song/:idSong
    async detailSong(req, res){
        var message = '';
        if(req.session.messageUpdateSong !== undefined)
            message = req.session.messageUpdateSong 
        if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
        if(!req.params.idSong){
            res.redirect('/manage/Song')
        }
        try {
            const song = await Song.findOne({_id: req.params.idSong});
            if(song){
                const categories = await Category.find({});
                const singers = await Singer.find({});
                const playlists = await Playlist.find({});
                const albums = await Album.find({});

                const songCategories = song.category
                const singerInSong = song.singer

                res.render('manage/ManageSong/editSong',{
                    isLogin: true,
                    categories: mutipleMongooseToObject(categories),
                    singers: mutipleMongooseToObject(singers), 
                    playlists: mutipleMongooseToObject(playlists),
                    albums: mutipleMongooseToObject(albums),
                    song: mongooseToObject(song),
                    message,
                    helpers: {
                        checkSong: function(id){ // set checked for checkbox
                            const idCategorySong = removeNewObjectID(id.toString());
                            if(songCategories.filter(s => s._id == idCategorySong).length > 0){ // true if category's id  is in this song
                                return 'checked';
                            }
                            else return '';
                        },
                        checkSinger: function(id){ // set checked for checkbox
                            const idSinger = removeNewObjectID(id.toString());
                            if(singerInSong.filter(s => s._id == idSinger).length > 0){ // true if singer's id  is in this song
                                return 'checked';
                            }
                            else return '';
                        },
                        checkAlbum: function(id){ // set checked for checkbox
                            return song.albumid.indexOf(id) !== -1 ? 'checked' : '';
                        },
                        checkPlaylist: function(id){
                            return song.playlistid.indexOf(id) !== -1 ? 'checked' : '';
                        }
                    }
                });
            }else{ // if there is no song
                res.redirect('/manage/Song');
            }
        } catch (error) {
            console.log(error.message);
            res.redirect('/manage/Song');
        }
    }

    //[GET] /manage/songImage/:idSong
    async songImage(req,res){
        var message = '';
        if(req.session.messageUpdateSongImage !== undefined)
            message = req.session.messageUpdateSongImage; 
        if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
        if(!req.params.idSong){
            res.redirect('/manage/Song');
        }
        try {
            const song = await Song.findOne({_id: req.params.idSong});
            if(song){
                const songImageAlt = getFileName(song.image);
                res.render('manage/ManageSong/updateSongImage',{
                    isLogin: true,
                    song: mongooseToObject(song),
                    message,
                    songImageAlt
                });
            }else{
                console.log('Không tìm thấy bài hát');
                res.redirect('/manage/Song');
            }
        }
         catch (error) {
            console.log(error.message);
            res.redirect('/manage/Song');
        }
    }

    //[PUT] /manage/songImage/updateSongImage
    async updateSongImage(req, res){
        try {
            if(req.body.idSong){
                const song = await Song.findById(req.body.idSong);
                if(song){
                    // req.body.image = req.protocol + '://' + req.headers.host + '/image/imageSong/' + req.file.filename;
                    req.body.image = req.protocol + '://' + getHost(req) + '/image/imageSong/' + req.file.filename;
                    Song.updateOne({_id: song._id}, req.body)
                        .then(function (){ // delete old image after update new image
                            const fileSongImage = getFileName(song.image);
                            deleteSongImage(fileSongImage);

                            req.session.messageUpdateSongImage = 'Sửa hình bài hát thành công';
                            res.redirect('/manage/songImage/'+ song._id);
                        }).catch(function(err){
                            console.log(err);
                            req.session.messageUpdateSongImage = 'Sửa hình bài hát Thất bại';
                            res.redirect('/manage/songImage/'+ song._id);
                        });
                }else{
                    res.redirect('/manage/Song/');
                }
            }else{
                res.redirect('/manage/Song/');
            }
        } catch (error) {
            console.log(error);
            req.session.messageUpdateSongImage = 'Sửa hình bài hát Thất bại';
            res.redirect('/manage/songImage/'+ req.body.idSong);
        }
    }

    //[PUT] /manage/Song/editSong
    async editSong(req, res){
        try {
            const categories = await Category.find({_id: {$in: req.body.categoryId}});
            const singers = await Singer.find({_id: {$in: req.body.singerId}});
            console.log(req.body.singerId)

            req.body.category = categories;
            req.body.singer = singers;
            req.body.playlistid = req.body.playlistId;
            req.body.albumid = req.body.albumId;

            console.log(req.body.category);
            console.log(req.body.singer);
            console.log(req.body.playlistid);
            console.log(req.body.albumid);

            Song.updateOne({_id: req.body.idSong}, req.body)
                .then(function(){
                    req.session.messageUpdateSong = 'Sửa bài hát thành công';
                    res.redirect('/manage/Song/'+ req.body.idSong);
                })
                .catch(function(err){
                    console.log(err.message);
                    req.session.messageUpdateSong = 'Sửa bài hát Thất bại';
                    res.redirect('/manage/Song/'+ req.body.idSong);
                });       
        } catch (error) {
            console.log(error.message);
            res.redirect('/manage/Song/' + req.body.idSong);
        }
    }

    // [DELETE] /Song/:idSong
    deleteSong(req,res){
        Song.findOneAndDelete({_id: req.params.idSong}, function(err, song){
            if(err) return err.message;
            else{
                const fileSongMusic = getFileName(song.link);
                const fileSongImage = getFileName(song.image);
                deleteSong(fileSongMusic);
                deleteSongImage(fileSongImage);
                res.redirect('/manage/Song/');
            }
        });
    }
    //===========================================================================================================

    //===================================================ALBUM===================================================
    // [GET] /manage/Album
    listAlbum(req, res) {
        if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
        else { 
            Album.find({}).exec(function(err, albums) {
                res.render('manage/ManageAlbum/manageAlbum', {
                    isLogin: true,
                    albums: mutipleMongooseToObject(albums),
                }); 
            });
        }
    }

    //[GET] /manage/Album/:idAlbum
    async detailAlbum(req, res){
        var message = '';
        if(req.session.messageUpdateAlbum !== undefined)
            message = req.session.messageUpdateAlbum 
        if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
        try {
            const album = await Album.findById(req.params.idAlbum);
            const singers = await Singer.find({});
            if(album) {
                const idSingerInAlbum = removeNewObjectID(album.singer._id.toString());
                res.render('manage/ManageAlbum/editAlbum',{
                    isLogin: true,
                    singers: mutipleMongooseToObject(singers), 
                    album: mongooseToObject(album),
                    message,
                    helpers: {
                        checkSinger: function(id){ // set checked for checkbox
                            const idSinger = removeNewObjectID(id.toString());
                            if(idSingerInAlbum == idSinger){ // true if singer's id  is in this song
                                return 'checked';
                            }
                            else return '';
                        },
                    }
                });
            }
            else {
                res.redirect('/manage/Album/');
            }
        } catch (error) {
            res.render('error/404/404');
            console.log(error);
            // res.send(error);
        }
    }

    //[PUT] /Manage/Album/editAlbum
    async editAlbum(req, res){
        try {
            const singer = await Singer.findById(req.body.singerId);
            if(singer){
                req.body.singer = singer;
                Album.updateOne({_id: req.body.idAlbum}, req.body)
                    .then(function(){
                        req.session.messageUpdateAlbum = 'Sửa playlist thành công';
                        res.redirect('/manage/Album/'+ req.body.idAlbum);
                    })
                    .catch(function(err){
                        req.session.messageUpdateAlbum = 'Sửa playlist Thất bại';
                        res.redirect('/manage/Album/'+ req.body.idAlbum);
                    });    
            }else{
                req.session.messageUpdateAlbum = 'Sửa playlist Thất bại';
                res.redirect('/manage/Album/'+ req.body.idAlbum);
            }
        } catch (error) {
            res.render('error/404/404');
            console.log(error);
        }
    }

    // [DELETE]  /manage/Album/:idAlbum
    deleteAlbum(req,res){
        try {
            Album.findOneAndDelete({_id: req.params.idAlbum}, function(err, album){
                if(err) {
                    res.render('error/404/404');
                    console.log(err.message);
                }
                if(album){
                    console.log(album);
                    const fileAlbumImage = getFileName(album.imageAlbum);
                    deleteAlbumImage(fileAlbumImage);
    
                    // delete album in song
                    Song.updateMany({albumid: album._id}, {$pull: {albumid: album._id}},{multi:true},function(err,songs){
                        res.redirect('/manage/Album/');
                    }); 
                }
                else{
                    res.render('error/404/404');
                }
            });
        } catch (error) {
            res.render('error/404/404');
            console.log(error);
        }
        
    }

    //[GET] /manage/albumImage/:idAlbum
    async albumImage(req,res){
        var message = '';
        if(req.session.messageUpdateAlbumImage !== undefined)
            message = req.session.messageUpdateAlbumImage; 
        if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
        if(!req.params.idAlbum){
            res.redirect('/manage/Album');
        }
        try {
            const album = await Album.findOne({_id: req.params.idAlbum});
            if(album){
                const albumImageAlt = getFileName(album.imageAlbum);
                res.render('manage/ManageAlbum/updateAlbumImage',{
                    isLogin: true,
                    album: mongooseToObject(album),
                    message,
                    albumImageAlt
                });
            }else{
                console.log('Không tìm thấy bài hát');
                res.redirect('/manage/Album');
            }
        }
         catch (error) {
            console.log(error.message);
            res.redirect('/manage/Album');
        }
    }

    //[PUT] /manage/albumImage/updateAlbumImage
    async updateAlbumImage(req, res){
        try {
            if(req.body.idAlbum){
                const album = await Album.findById(req.body.idAlbum);
                if(album){
                    // req.body.imageAlbum = req.protocol + '://' + req.headers.host + '/image/imageAlbum/' + req.file.filename;
                    req.body.imageAlbum = req.protocol + '://' + getHost(req) + '/image/imageAlbum/' + req.file.filename;
                    Album.updateOne({_id: album._id}, req.body)
                        .then(function (){ // delete old image after update new image
                            const fileAlbumImage = getFileName(album.imageAlbum);
                            console.log(fileAlbumImage);
                            deleteAlbumImage(fileAlbumImage);

                            req.session.messageUpdateAlbumImage = 'Sửa hình album thành công';
                            res.redirect('/manage/albumImage/'+ album._id);
                        }).catch(function(err){
                            console.log(err);
                            req.session.messageUpdateAlbumImage = 'Sửa hình album Thất bại';
                            res.redirect('/manage/albumImage/'+ album._id);
                        });
                }else{
                    res.redirect('/manage/Album/');
                }
            }else{
                res.redirect('/manage/Album/');
            }
        } catch (error) {
            console.log(error);
            req.session.messageUpdateAlbumImage = 'Sửa hình album Thất bại';
            res.redirect('/manage/albumImage/'+ req.body.idAlbum);
        }
    }
    
    //===========================================================================================================

    //===================================================SINGER==================================================
    // [GET] /manage/Singer
    listSinger(req, res) {
        if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
        else { 
            Singer.find({}).exec(function(err, singers) {
                res.render('manage/ManageSinger/manageSinger', {
                    isLogin: true,
                    singers: mutipleMongooseToObject(singers),
                }); 
            });
        }
    }
    //[GET] /manage/Singer/:idSinger
    detailSinger(req, res){
        var message = '';
        if(req.session.messageUpdateSinger !== undefined)
            message = req.session.messageUpdateSinger 
        if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
        Singer.findOne({_id: req.params.idSinger}).exec(function(err, singer) { // get id singer to edit
            if(singer === undefined) res.redirect('/manage/singer') // reload current website if singer is undefined
            else{
                res.render('manage/ManageSinger/editSinger',{
                    isLogin: true,
                    singer: mongooseToObject(singer),
                    message
                });
            }
        });
    }

    //[PUT] /Manage/Singer/editSinger
    editSinger(req, res){
        Singer.updateOne({_id: req.body.idSinger}, req.body)
            .then(function(){
                req.session.messageUpdateSinger = 'Sửa ca sĩ thành công';
                res.redirect('/manage/Singer/'+ req.body.idSinger);
            })
            .catch(function(err){
                req.session.messageUpdateSinger = 'Sửa ca sĩ Thất bại';
                res.redirect('/manage/Singer/'+ req.body.idSinger);
            });    
    }
    // [DELETE]  /manage/Singer/:idSinger
    deleteSinger(req,res){
        Singer.findOneAndDelete({_id: req.params.idSinger}, function(err, singer){
            if(err) return err.message;
            else{
                const fileSingerImage = getFileName(singer.image);
                deleteSingerImage(fileSingerImage);

                // delete singer in song
                Song.updateMany({'singer._id': singer._id}, {$pull: {singer: {_id: singer._id}}},{multi:true},function(err,songs){
                    res.redirect('/manage/Singer/');
                }); 
            }
        });
    }
    //[GET] /manage/singerImage/:idSinger
    async singerImage(req,res){
        var message = '';
        if(req.session.messageUpdateSingerImage !== undefined)
            message = req.session.messageUpdateSingerImage; 
        if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
        if(!req.params.idSinger){
            res.redirect('/manage/Singer');
        }
        try {
            const singer = await Singer.findOne({_id: req.params.idSinger});
            if(singer){
                const singerImageAlt = getFileName(singer.image);
                res.render('manage/ManageSinger/updateSingerImage',{
                    isLogin: true,
                    singer: mongooseToObject(singer),
                    message,
                    singerImageAlt
                });
            }else{
                console.log('Không tìm thấy bài hát');
                res.redirect('/manage/Singer');
            }
        }
         catch (error) {
            console.log(error.message);
            res.redirect('/manage/Singer');
        }
    }

    //[PUT] /manage/singerImage/updateSingerImage
    async updateSingerImage(req, res){
        try {
            if(req.body.idSinger){
                const singer = await Singer.findById(req.body.idSinger);
                if(singer){
                    // req.body.image = req.protocol + '://' + req.headers.host + '/image/imageSinger/' + req.file.filename;
                    req.body.image = req.protocol + '://' + getHost(req) + '/image/imageSinger/' + req.file.filename;
                    Singer.updateOne({_id: singer._id}, req.body)
                        .then(function (){ // delete old image after update new image
                            const fileSingerImage = getFileName(singer.image);
                            deleteSingerImage(fileSingerImage);

                            req.session.messageUpdateSingerImage = 'Sửa hình ca sĩ thành công';
                            res.redirect('/manage/singerImage/'+ singer._id);
                        }).catch(function(err){
                            console.log(err);
                            req.session.messageUpdateSingerImage = 'Sửa hình ca sĩ Thất bại';
                            res.redirect('/manage/singerImage/'+ singer._id);
                        });
                }else{
                    res.redirect('/manage/Singer/');
                }
            }else{
                res.redirect('/manage/Singer/');
            }
        } catch (error) {
            console.log(error);
            req.session.messageUpdateSingerImage = 'Sửa hình ca sĩ Thất bại';
            res.redirect('/manage/singerImage/'+ req.body.idSinger);
        }
    }
    //================================================================================================================

    //=============================================     Playlist    ==================================================
    // [GET] /manage/Playlist
    listPlaylist(req, res) {
        if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
        else { 
            Playlist.find({}).exec(function(err, playlists) {
                res.render('manage/ManagePlaylist/managePlaylist', {
                    isLogin: true,
                    playlists: mutipleMongooseToObject(playlists),
                }); 
            });
        }
    }

    //[GET] /manage/Playlist/:idPlaylist
    detailPlaylist(req, res){
        var message = '';
        if(req.session.messageUpdatePlaylist !== undefined)
            message = req.session.messageUpdatePlaylist 
        if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
        Playlist.findOne({_id: req.params.idPlaylist}).exec(function(err, playlist) { // get id singer to edit
            if(playlist === undefined) res.redirect('/manage/playlist') // reload current website if singer is undefined
            else{
                res.render('manage/ManagePlaylist/editPlaylist',{
                    isLogin: true,
                    playlist: mongooseToObject(playlist),
                    message
                });
            }
        });
    }

    //[PUT] /manage/Playlist/editPlaylist
    editPlaylist(req, res){
        Playlist.updateOne({_id: req.body.idPlaylist}, req.body)
            .then(function(){
                req.session.messageUpdatePlaylist = 'Sửa playlist thành công';
                res.redirect('/manage/Playlist/'+ req.body.idPlaylist);
            })
            .catch(function(err){
                req.session.messageUpdatePlaylist = 'Sửa playlist Thất bại';
                res.redirect('/manage/Playlist/'+ req.body.idPlaylist);
            });    
    }
    
    // [DELETE]  /manage/Playlist/:idPlaylist
    deletePlaylist(req,res){
        Playlist.findOneAndDelete({_id: req.params.idPlaylist}, function(err, playlist){
            if(err) return err.message;
            else{
                const filePlaylistImage = getFileName(playlist.image);
                deletePlaylistImage(filePlaylistImage);

                // delete singer in song
                Song.updateMany({playlistid: playlist._id}, {$pull: {playlistid: playlist._id}},{multi:true},function(err,songs){
                    res.redirect('/manage/Playlist/');
                }); 
            }
        });
    }

    //[GET] /manage/playlistImage/:idPlaylist
    async playlistImage(req,res){
        var message = '';
        if(req.session.messageUpdatePlaylistImage !== undefined)
            message = req.session.messageUpdatePlaylistImage; 
        if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
        if(!req.params.idPlaylist){
            res.redirect('/manage/Playlist');
        }
        try {
            const playlist = await Playlist.findOne({_id: req.params.idPlaylist});
            if(playlist){
                const playlistImageAlt = getFileName(playlist.image);
                res.render('manage/ManagePlaylist/updatePlaylistImage',{
                    isLogin: true,
                    playlist: mongooseToObject(playlist),
                    message,
                    playlistImageAlt
                });
            }else{
                console.log('Không tìm thấy bài hát');
                res.redirect('/manage/Playlist');
            }
        }
         catch (error) {
            console.log(error.message);
            res.redirect('/manage/Playlist');
        }
    }

    //[PUT] /manage/playlistImage/updatePlaylistImage
    async updatePlaylistImage(req, res){
        try {
            if(req.body.idPlaylist){
                const playlist = await Playlist.findById(req.body.idPlaylist);
                if(playlist){
                    // req.body.image = req.protocol + '://' + req.headers.host + '/image/imagePlaylist/' + req.file.filename;
                    req.body.image = req.protocol + '://' + getHost(req) + '/image/imagePlaylist/' + req.file.filename;
                    Playlist.updateOne({_id: playlist._id}, req.body)
                        .then(function (){ // delete old image after update new image
                            const filePlaylistImage = getFileName(playlist.image);
                            deletePlaylistImage(filePlaylistImage);

                            req.session.messageUpdatePlaylistImage = 'Sửa hình playlist thành công';
                            res.redirect('/manage/playlistImage/'+ playlist._id);
                        }).catch(function(err){
                            console.log(err);
                            req.session.messageUpdatePlaylistImage = 'Sửa hình playlist Thất bại';
                            res.redirect('/manage/playlistImage/'+ playlist._id);
                        });
                }else{
                    res.redirect('/manage/Playlist/');
                }
            }else{
                res.redirect('/manage/Playlist/');
            }
        } catch (error) {
            console.log(error);
            req.session.messageUpdatePlaylistImage = 'Sửa hình playlist Thất bại';
            res.redirect('/manage/playlistImage/'+ req.body.idPlaylist);
        }
    }
    
    //================================================================================================================

    //=============================================     CATEGORY    ==================================================
    // [GET] /manage/Category
    listCategory(req, res) {
        if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
        else { 
            Category.find({}).exec(function(err, categories) {
                res.render('manage/ManageCategory/manageCategory', {
                    isLogin: true,
                    categories: mutipleMongooseToObject(categories),
                }); 
            });
        }
    }

    //[GET] /manage/Category/:idCategory
    detailCategory(req, res){
        var message = '';
        if(req.session.messageUpdateCategory !== undefined)
            message = req.session.messageUpdateCategory 
        if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
        Category.findOne({_id: req.params.idCategory}).exec(function(err, category) { // get id singer to edit
            if(category === undefined) res.redirect('/manage/category') // reload current website if singer is undefined
            else{
                res.render('manage/ManageCategory/editCategory',{
                    isLogin: true,
                    category: mongooseToObject(category),
                    message
                });
            }
        });
    }

    //[PUT] /manage/Category/editCategory
    editCategory(req, res){
        Category.updateOne({_id: req.body.idCategory}, req.body)
            .then(function(){
                req.session.messageUpdateCategory = 'Sửa thể loại thành công';
                res.redirect('/manage/Category/'+ req.body.idCategory);
            })
            .catch(function(err){
                req.session.messageUpdateCategory = 'Sửa thể loại Thất bại';
                res.redirect('/manage/Category/'+ req.body.idCategory);
            });    
    }

    // [DELETE]  /manage/Category/:idCategory
    deleteCategory(req,res){
        Category.findOneAndDelete({_id: req.params.idCategory}, function(err, category){
            if(err) return err.message;
            else{
                // delete category in song
                Song.updateMany({'category._id': category._id}, {$pull: {category: {_id: category._id}}},{multi:true},function(err,songs){
                    res.redirect('/manage/Category/');
                }); 
            }
        });
    }

    //[GET] /manage/categoryImage/:idCategory
    async categoryImage(req,res){
        var message = '';
        if(req.session.messageUpdateCategoryImage !== undefined)
            message = req.session.messageUpdateCategoryImage; 
        if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
        if(!req.params.idCategory){
            res.redirect('/manage/Category');
        }
        try {
            const category = await Category.findOne({_id: req.params.idCategory});
            if(category){
                const categoryImageAlt = getFileName(category.imageCategory);
                res.render('manage/ManageCategory/updateCategoryImage',{
                    isLogin: true,
                    category: mongooseToObject(category),
                    message,
                    categoryImageAlt
                });
            }else{
                console.log('Không tìm thấy bài hát');
                res.redirect('/manage/Category');
            }
        }
         catch (error) {
            console.log(error.message);
            res.redirect('/manage/Category');
        }
    }

    //[PUT] /manage/categoryImage/updateCategoryImage
    async updateCategoryImage(req, res){
        try {
            if(req.body.idCategory){
                const category = await Category.findById(req.body.idCategory);
                if(category){
                    // req.body.imageCategory = req.protocol + '://' + req.headers.host + '/image/imageCategory/' + req.file.filename;
                    req.body.imageCategory = req.protocol + '://' + getHost(req) + '/image/imageCategory/' + req.file.filename;
                    Category.updateOne({_id: category._id}, req.body)
                        .then(function (){ // delete old image after update new image
                            const fileCategoryImage = getFileName(category.imageCategory);
                            console.log(fileCategoryImage);
                            deleteCategoryImage(fileCategoryImage);

                            req.session.messageUpdateCategoryImage = 'Sửa hình thể loại thành công';
                            res.redirect('/manage/categoryImage/'+ category._id);
                        }).catch(function(err){
                            console.log(err);
                            req.session.messageUpdateCategoryImage = 'Sửa hình thể loại Thất bại';
                            res.redirect('/manage/categoryImage/'+ category._id);
                        });
                }else{
                    res.redirect('/manage/Category/');
                }
            }else{
                res.redirect('/manage/Category/');
            }
        } catch (error) {
            console.log(error);
            req.session.messageUpdateCategoryImage = 'Sửa hình thể loại Thất bại';
            res.redirect('/manage/categoryImage/'+ req.body.idCategory);
        }
    }
    //================================================================================================================
}

module.exports = new ManageController;