
const Singer = require('../../models/Singer');
const {getHost} = require('../../../util/getHost');
class InsertSingerController {

    // [GET] /insertSinger 
    insertSinger(req, res) {
        if(req.session && (req.session.username == undefined)) res.redirect('/admin/login'); // if admin still not login
        res.render('insertlayouts/InsertSinger');
    }

    // [POST] /insertSingerPost 
    insertSingerPost(req, res){
        console.log('req.file.path: ' + req.file.path);
        console.log('req.file.pathname: ' + req.file.filename);
        console.log('req.body.singername: ' + req.body.singername);

        req.body.image = req.protocol + '://' + getHost(req) + '/image/imagesinger/' + req.file.filename;
        // req.body.image = req.protocol + '://' + req.headers.host + '/image/imagesinger/' + req.file.filename;
        console.log(req.body);
        const singer = new Singer(req.body);
        singer.save()
            .then(function(){
                res.json( {status : 'Thêm ca sĩ thành công!!!'})
            })
            .catch(function(err){
                res.json({ status: 'Thêm ca sĩ thất bại\n ', error_message: err.message })
            })          
    }
}

module.exports = new InsertSingerController;