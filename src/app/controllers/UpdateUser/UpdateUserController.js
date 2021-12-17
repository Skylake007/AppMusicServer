const User = require('../../models/User');
const Playlist = require('../../models/Playlist');
const Singer = require('../../models/Singer');
const {removeNewObjectID} = require('../../../util/RemoveNewObjectID');
const {removeArrayNewObjectID} = require('../../../util/RemoveNewObjectID');
const Album = require('../../models/Album');
const {deleteAvatarUser} = require('../../../util/deleteFile'); 
const { getFileName } = require('../../../util/getFileNameFromLink');

class UpdateUserController{

    //[PUT] /updateuser?email="value"&name="value"&sex="value"
    index(req,res) {
        const email = req.query.email;
        const name = req.query.name;
        const sex = req.query.sex;

        if(!email || !name || !sex) {
            res.json({
                error: true,
                messenger: "Vui Lòng nhập đầy đủ thông tin"
            })
        }
        else{
            User.findOne({ email : email}, function(err, user) {
                if(!err) {
                    if(!user) {
                        res.json({
                            error: true,
                            message : "Email này chưa tồn tại"
                        })
                    }
                    else {
                        user.name = name;
                        user.sex = sex;
                        user.save(function(err1) {
                            if(!err1) {
                                res.json({
                                    error: false,
                                    message : "Thay đổi thành công",
                                    user
                                })
                            }
                            else{
                                console.log(err);
                            }
                        })
                    }
                }
                else {
                    console.log(err);
                }
            })
        }
    } 

    //[PUT] /updateuser/AddLoveOrRemovePlaylist?userId='?'&playlistId='?'&status='boolean'
    addLovePlaylist(req, res){
        if(!req.query.playlistId){
            res.json({ error: true, message: 'Playlist Id không được để trống'});
        }
        else if(!req.query.userId){
            res.json({ error: true, message: 'User Id không được để trống'});
        }
        else if(!req.query.status){
            res.json({ error: true, message: 'status không được để trống'});
        }else{
            console.log(req.query.status)
            console.log(req.query.userId)
            console.log(req.query.playlistId)
            const playlistId = req.query.playlistId;
            const userId = req.query.userId;
            const status = req.query.status.toLowerCase() === 'true';
            Playlist.findById(playlistId).exec(function(err, playlist){
                if(playlist === null || playlist === undefined){
                    res.json({error: true, message: 'Playlist không tồn tại'});
                }
                else {
                    if(status){ // add playlist to favorites list
                        var isAlreadyExistPlaylist = false; // if user has already added a playlist to their favorites playlist
                        User.findOne({_id: userId}).exec(function(err, user){
                            if(!user) res.json({error: true, message: 'User không tồn tại'});
                            else{
                                user.followPlaylist.forEach(function(playlist){ 
                                    if(removeNewObjectID(playlist._id.toString()) === playlistId){
                                        isAlreadyExistPlaylist = true;
                                    }
                                });

                                if(isAlreadyExistPlaylist){
                                    res.json({error: true, message: 'Playlist này đã có trong mục ưa thích '});
                                }else{
                                    User.findOneAndUpdate({ _id: userId }, {$push: {followPlaylist: playlist}}).exec(function(err, user){
                                        if(err) res.json({ error: true, message: err.message });
                                        // else if(user === undefined || user === null){
                                        //     res.json({ error: true, message: 'Người dùng không tồn tại' });
                                        // }
                                        else {
                                            User.findOne({ _id: userId }).exec(function(err, user){
                                                res.json({ error: false, message: 'Đã thêm vào playlist ưa thích', user});
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                    else{ // remove favorite playlist
                        User.findOneAndUpdate({ _id: userId }, {$pull: {followPlaylist: {_id: playlist._id}}}).exec(function(err, user){
                            if(err) res.json({ error: true, message: err.message });
                            else if(user === undefined || user === null){
                                res.json({ error: true, message: 'Người dùng không tồn tại' });
                            }else {
                                User.findOne({ _id: userId }).exec(function(err, user){
                                    res.json({ error: false, message: 'Đã xóa khỏi playlist ưa thích', user});
                                });
                            }
                        });
                    }
                }
            });
        }
    }

    //[PUT] /updateuser/AddLoveOrRemoveAlbum?userId='?'&albumId='?'status='boolean'
    addLoveAlbum(req, res){
        if(!req.query.albumId){
            res.json({ error: true, message: 'Album Id không được để trống'});
        }
        else if(!req.query.userId){
            res.json({ error: true, message: 'User Id không được để trống'});
        }
        else if(!req.query.status){
            res.json({ error: true, message: 'status không được để trống'});
        }else{
            const albumId = req.query.albumId;
            const userId = req.query.userId;
            const status = req.query.status.toLowerCase() === 'true';
            Album.findById(albumId).exec(function(err, album){
                if(album === null || album === undefined){
                    res.json({error: true, message: 'album không tồn tại'});
                }
                else {
                    if(status){ // add album to favorites list
                        var isAlreadyExistAlbum = false; // if user has already added a album to their favorites album
                        User.findOne({_id: userId}).exec(function(err, user){
                            if(!user) res.json({error: true, message: 'User không tồn tại'});
                            else{
                                user.followAlbum.forEach(function(album){ 
                                    if(removeNewObjectID(album._id.toString()) === albumId){
                                        isAlreadyExistAlbum = true;
                                    }
                                });

                                if(isAlreadyExistAlbum){
                                    res.json({error: true, message: 'Album này đã có trong mục ưa thích '});
                                }else{
                                    User.findOneAndUpdate({ _id: userId }, {$push: {followAlbum : album}}).exec(function(err, user){
                                        if(err) res.json({ error: true, message: err.message });
                                        // else if(user === undefined || user === null){
                                        //     res.json({ error: true, message: 'Người dùng không tồn tại' });
                                        // }
                                        else {
                                            User.findOne({ _id: userId }).exec(function(err, user){
                                                res.json({ error: false, message: 'Đã thêm vào album ưa thích', user});
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                    else{ // remove favorite playlist
                        User.findOneAndUpdate({ _id: userId }, {$pull: {followAlbum: {_id: album._id}}}).exec(function(err, user){
                            if(err) res.json({ error: true, message: err.message });
                            else if(user === undefined || user === null){
                                res.json({ error: true, message: 'Người dùng không tồn tại' });
                            }else {
                                User.findOne({ _id: userId }).exec(function(err, user){
                                    res.json({ error: false, message: 'Đã xóa khỏi album ưa thích', user});
                                });
                            }
                        });
                    }
                }
            });
        }
    }

    //[PUT] /updateuser/removeFavoriteSinger?singerid='values'&userid='values'
    async removeFavoriteSinger(req, res){
        try {
            if(!req.query.singerid){ // singerid is not empty
                res.json({ error:true, message: 'ID ca sĩ không được để trống' });
            }
            else if(!req.query.userid){ // userid is not empty
                res.json({ error:true, message: 'ID người dùng không được để trống' });
            }

            const user = await User.findById(req.query.userid);
            if(user){ // user is valid
                const singerId = await Singer.findOne({_id: req.query.singerid}, '_id'); // get id singer
                if(singerId){
                    const newSingerId = removeNewObjectID(singerId.toString()); // get only singerids which are in mongodb
                    User.updateOne({ _id: user._id }, {$pull: {favoriteSinger: newSingerId}}, async function(err, user){
                        if(err) res.json({ error: true, message: err.message });
                        else{
                            const user = await User.findById(req.query.userid); // return new update user to json
                            res.json({ error:false, message: 'Đã xóa khỏi danh sách ca sĩ ưa thích', user });
                        }
                    });
                }else{
                    res.json({ error:true, message: 'Không tìm thấy Ca sĩ' });
                }
            }else{
                res.json({ error:true, message: 'User không tồn tại' });
            }
        } catch (error) {
            console.log(error);
            res.json({ error:true, message: 'ID ca sĩ hoặc ID User có thể không hợp lệ', note: error.message });
        }
    }

    //[PUT] /updateuser/AddFavoriteSinger?singerid='values'&userid='values'
    async addFavoriteSinger(req, res){
        try {
            if(!req.query.singerid){ // singerid is not empty
                res.json({ error:true, message: 'ID ca sĩ không được để trống' });
            }
            else if(!req.query.userid){ // userid is not empty
                res.json({ error:true, message: 'ID người dùng không được để trống' });
            }

            const user = await User.findById(req.query.userid);
            if(user){ // user is valid
                const singerId = await Singer.findOne({_id: req.query.singerid}, '_id'); // get id singer
                if(singerId){
                    const newSingerId = removeNewObjectID(singerId.toString()); // get only singerids which are in mongodb
                    User.updateOne({ _id: user._id }, {$addToSet: {favoriteSinger: newSingerId}}, async function(err, user){
                        if(err) res.json({ error: true, message: err.message });
                        else{
                            const user = await User.findById(req.query.userid); // return new update user to json
                            res.json({ error:false, message: 'Đã thêm vào danh sách ca sĩ ưa thích', user });
                        }
                    });
                }else{
                    res.json({ error:true, message: 'Không tìm thấy Ca sĩ' });
                }
            }else{
                res.json({ error:true, message: 'User không tồn tại' });
            }
        } catch (error) {
            console.log(error);
            res.json({ error:true, message: 'ID ca sĩ hoặc ID User có thể không hợp lệ', note: error.message });
        }
    }

    //[PUT] /updateuser/AddManyFavoriteSinger
    async addManyFavoriteSinger(req, res){
        try {
            if(!req.body.singerid){ // singerid is not empty
                res.json({ error:true, message: 'ID ca sĩ không được để trống' });
            }
            else if(!req.body.userid){ // userid is not empty
                res.json({ error:true, message: 'ID người dùng không được để trống' });
            }
            else{
                const user = await User.findById(req.body.userid);
                if(user){ // user is valid
                    const singerId = await Singer.find({_id: {$in: req.body.singerid}}, '_id'); // get id singer
                    if(singerId.length !== 0){ // singerid is not empty
                        const newSingerId = removeArrayNewObjectID(singerId); // get only singerids which are in mongodb
                        User.updateOne({ _id: user._id }, {$addToSet: {favoriteSinger: newSingerId}}, async function(err, user){
                            if(err) res.json({ error: true, message: err.message });
                            else{
                                const user = await User.findById(req.body.userid);
                                res.json({ error:false, message: 'cập nhật thông tin user thành công', user });
                            }
                        });
                    }
                    else{
                        res.json({ error:true, message: 'Không tìm thấy Ca sĩ' });
                    }
                }
                else{ 
                    res.json({ error:true, message: 'User không tồn tại' });
                }
            }
        } catch (error) {
            res.json({ error:true, message: 'ID ca sĩ hoặc ID User có thể không hợp lệ', note: error.message});
        }
    }

    //[PUT] /updateuser/UpdateAvatarUser?image="value"&idUser="value"
    async insertAvatarUser(req, res) {
        try{
            console.log('req.file.path: ' + req.file.path);
            console.log('req.file.pathname: ' + req.file.filename);
            console.log('req.body.idUser' + req.body.idUser);

            req.body.image = req.protocol + '://' + req.headers.host + '/image/imageuser/' + req.file.filename;
            console.log(req.body.image)
            const user = await User.findById(req.body.idUser)
            if(user){
                if(user.avatar !== undefined) {
                    const fileAvatarUser = getFileName(user.avatar)
                    deleteAvatarUser(fileAvatarUser)
                }
                user.avatar = req.body.image
                user.save(function(err){
                    if(!err) {
                        res.json({
                            error: false,
                            message: "Thêm hình thành công",
                            user
                        })
                    }
                    else {
                        console.log(err);
                    }
                })
            }
        }
        catch(error){
            console.log(error);
                res.json({ error:true, message: error.message, note: 'ID User có thể không hợp lệ' })
        }
    } 
}

module.exports = new UpdateUserController;