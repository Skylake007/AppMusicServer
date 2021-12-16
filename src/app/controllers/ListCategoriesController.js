const Category = require('../models/Category');
const Song = require('../models/Category');

class ListCategoriesController {

    // [GET] /category/getAllCategories
    async getAllCategories (req,res) {
        try{
            const category = await Category.find({});
            if (category) {
                res.json({ error: false, message: '', category });
            }
            else {
                res.json({ error: true, message: 'Lỗi không thể lấy được danh sach thể loại'});
            }
        }
        catch (error) {
            res.json({ error: true, message: err.message });
        }
    }
}

module.exports = new ListCategoriesController;