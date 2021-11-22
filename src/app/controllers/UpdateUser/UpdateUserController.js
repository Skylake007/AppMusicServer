const User = require('../../models/User');
const Playlist = require('../../models/Playlist');
const Singer = require('../../models/Singer');
const {removeNewObjectID} = require('../../../util/RemoveNewObjectID');
const {removeArrayNewObjectID} = require('../../../util/RemoveNewObjectID');
class UpdateUserController{

    //[PUT] /updateuser?email="value"&name="value"&sex="value"
    index(req,res) {
        const email = req.query.email;
        const name = req.query.name;
        const sex = req.query.sex;
        User.findOne({ email : email}, function(err, user) {
            if(!err) {
                if(user === undefined) {
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

    //[PUT] /updateuser/AddLovePlaylist?userId='?'&playlistId='?'status='boolean'
    addLovePlaylist(req, res){
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

    //[PUT] /updateuser/addFavoriteSinger
    async addFavoriteSinger(req, res){
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
                        console.log(newSingerId);
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
            res.json({ error:true, message: error.message, note: 'ID ca sĩ hoặc ID User có thể không hợp lệ' });
        }
    }
}

module.exports = new UpdateUserController;