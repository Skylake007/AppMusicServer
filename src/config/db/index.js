const mongoose = require('mongoose');

async function connect() {
    try {
        // await mongoose.connect('mongodb://localhost:27017/MusicDatabase',{
        // await mongoose.connect('mongodb+srv://nghia:nghia123456@teamusic.e5j2p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{ // của nghĩa
        // await mongoose.connect('mongodb+srv://teacupmusicmp3:teacupmusicmp3123@teamusic.jjja9.mongodb.net/TeaMusicDatabase?retryWrites=true&w=majority',{
        await mongoose.connect('mongodb+srv://siphan:si819202@cluster0.hlqz6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{ //si
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('connect successfully!!!');
    } catch (error) {
        console.log('failure!!!');
        console.log(error);
    }
}

module.exports = { connect };