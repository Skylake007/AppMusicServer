const mongoose = require('mongoose');

async function connect() {
    try {
        // await mongoose.connect('mongodb://localhost:27017/MusicDatabase',{
        await mongoose.connect('mongodb+srv://teacupmusicmp3:teacupmusicmp3123@teamusic.jjja9.mongodb.net/TeaMusicDatabase?retryWrites=true&w=majority',{
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