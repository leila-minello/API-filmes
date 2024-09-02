const mongoose = require('mongoose')
const dotenv =  require('dotenv').config();

const connectDB = async () => {

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Banco de dados conectado!');
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;