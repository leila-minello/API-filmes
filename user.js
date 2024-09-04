const mongoose = require('../db');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    ehAdmin: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.createAdmin = async () => {
    const admExiste = await User.findOne({username: "admin"});
    if (!admExiste) {
        const admUser = new User ({
            username: "admCartaCaixa",
            senha: "adm1902",
            ehAdmin: true
        });

        await admUser.save();
        console.log("Admin criado com sucesso!");
    } else {
        console.log("Admin já existe.");
    }
}