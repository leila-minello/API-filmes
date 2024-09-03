var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();

const User = require("../model/user");

const chave = 'PF14071982'; 

//rota para login de user
router.post('/login', async (req, res) => {
    const { username, senha } = req.body;
    
    try {
        const user = await User.findOne({username});
        if (!user || user.senha !== senha) {
            return res.status(401).json({ status: false, error: 'Login inválido! User ou senha errados.' });
        }

        const token = jwt.sign({ message: 'LOG DE FILMES ABERTO', id: user._id, ehAdmin: user.ehAdmin }, chave, { expiresIn: '1h' });
        res.json({ status: true, token: token });

        } catch (error) {
            res.status(500).json({ status: false, error: 'Erro na autenticação, tente novamente.' });
    }
});

//rota para então verificar o token com post
router.post('/verificaToken', (req, res) => {
    const {token} = req.body;
    
    if (!token) {
        return res.status(400).json({ status: false, error: 'É obrigatório inserir token!' });
    }

    try {
        const decoded = jwt.verify(token, chave);
        res.json({ status: true, message: decoded.message });
    } catch (error) {
        res.status(401).json({ status: false, error: 'O token é inválido ou já expirou' });
    }
});

//rota para cadastro de usuários
router.post('/registro', async (req, res) => {
    const { username, senha, ehAdmin } = req.body;

    try {
        let user = await User.findOne({username});
        if (user) {
            return res.status(400).json({ status: false, error: 'Usuário já existente.'});
        }

        user = new User({ username, senha, ehAdmin });
        await user.save();

        res.status(201).json({ status: true, user: user });
    } catch (error) {
        res.status(500).json({ status: false, error: 'Erro ao criar usuário!' });
    }

});

//middleware para verificar token
function verificarToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ status: false, error: 'Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, chave);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ status: false, error: 'Token inválido ou expirado.' });
    }
}

//middleware para verificar se o usuário é admin
function verificaAdmin(req, res, next) {
    if (!req.user.ehAdmin) {
        return res.status(403).json({ status: false, error: 'Negado. Acesso permitido apenas para admins.' });
    }
    next();
}

module.exports = { router, verificarToken, verificaAdmin };
