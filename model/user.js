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
                username: "admin",
                senha: "admin123", // Defina uma senha padrão
                role: "admin"
            });
            console.log("Usuário administrador criado com sucesso");
        } else {
            console.log("Usuário administrador já existe");
        }
    } catch (error) {
        throw new Error("Erro ao criar o usuário administrador: " + error.message);
    }
}