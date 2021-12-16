const Singer = require('../models/Singer');

class AdminController {

    // [GET] /singer/
    index(req, res){
        res.json({ error: true, message: 'Nothing Happen Hihihi', note: '' });
    }

    // [GET] /singer/getOneSinger?singerId='values'
    async getOneSinger(req, res){
        try {
            if(!req.query.singerId){
                res.json({ error: true, message: 'Hãy nhập singer ID', note:'' });
            }
            const singer = await Singer.findById(req.query.singerId);
            if(singer){
                res.json({ error: false, singer});
            }else{
                res.json({ error:true, message:'không tìm thấy ca sĩ', note: ''});
            }
        } catch (error) {
            console.log(error);
            res.json({ error: true, message: 'Singer ID không hợp lệ !!!', note: error.message });
        }
    }   

    // [GET] /singer/getListSinger  => use req.body to get idsinger
    async getListSinger(req, res){
        try {
            if(!req.body.singerIds){
                res.json({ error: true, message: 'Chưa có ca sĩ yêu thích', note:'' });
            }
            else{
                const singerIds = req.body.singerIds;
                const listSinger = await Singer.find({_id: {$in: singerIds}});
                if(listSinger.length != 0){
                    res.json({ error: false, singers: listSinger});
                }else{
                    res.json({ error:true, message:'không tìm thấy ca sĩ', note: ''});
                }
            }
        } catch (error) {
            res.json({ error: true, message: 'Singer ID không hợp lệ !!!', note: error.message });
        }
    }
    
}

module.exports = new AdminController;