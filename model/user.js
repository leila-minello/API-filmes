const mongoose = require('../db');
const mongoose = require('mongoose');
require('dotenv').config();

//esquema para criação de usuário
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    ehAdmin: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

//criação de usuário admin
module.exports.createAdmin = async () => {
    const admExiste = await User.findOne({username: process.env.USERNAME_ADM});
    if (!admExiste) {
        const admUser = new User ({
            username: process.env.USERNAME_ADM,
            senha: process.env.adm1902,
            ehAdmin: true
        });

        await admUser.save();
        console.log("Admin criado com sucesso!");
    } else {
        console.log("Admin já existe.");
    }
}