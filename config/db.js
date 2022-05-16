const mongoose = require('mongoose');
const config = require('config');
const db = config.get('dbRemote');
const dbConnect = async () => {
    try {
        await mongoose.connect(db, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
        });
        console.log('DB Connected Successfuly');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

module.exports = dbConnect;
