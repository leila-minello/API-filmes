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

//criação de usuário admin na inicialização
User.createAdmin = async function() {
    try {
        const adminExists = await this.findOne({ role: "admin" });
        if (!adminExists) {
            await this.create({
                username: "admCartaCaixa",
                senha: "adm1902", 
                ehAdmin: true
            });
            console.log("Admin criado com sucesso!");
        } else {
            console.log("Admin já existe.");
        }
    } catch (error) {
        throw new Error("Erro ao criar o admin!: " + error.message);
    }
}