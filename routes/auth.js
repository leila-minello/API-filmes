var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();

const chave = 'PF14071982'; 

//rota para gerar o token com get 
router.get('/token', (req, res) => {
    const token = jwt.sign({ message: 'LOG DE FILMES ABERTO' }, chave, { expiresIn: '1h' });
    res.json({ status: true, token: token });
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

module.exports = router;
