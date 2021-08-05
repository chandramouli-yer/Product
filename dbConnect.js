const mongoose=require('mongoose');
const dbConfig = require('./config/database.config')
 exports.connectToMongoDB=function (){
    
    mongoose.connect(dbConfig.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    }).then(() => {
        console.log("Successfully connected to the MongoDB database");
    }).catch(err => {
        console.log('Could not connect to the database. Exiting now...', err);
        process.exit();
    });
    }

