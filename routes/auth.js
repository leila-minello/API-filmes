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
        console.error('Erro detalhado:', error);
        res.status(500).json({ status: false, error: 'Erro ao criar usuário!' });
    }

});

//rota para criação de outros admins (apenas para admins)
router.post('/criaAdm', verificarToken, verificaAdmin, async (req, res) => {
    const {username, senha} = req.body;

    try {
        let user = await User.findOne({username});
        if (user) {
            return res.status(400).json({ status: false, error: "Já existe usuário com esse username."})
        }

        const novoAdm = new User({ username, senha, ehAdmin: true});
        await novoAdm.save();

        res.status(201).json({status: true, user: novoAdm});
    }

    catch (error) {
        res.status(500).json({ status: false, error: "Erro ao criar o administrador!"})
    }
});

//rota para excluir usuários (apenas para admins) 
router.delete('/deletaUser/:id', verificarToken, verificaAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ status: false, error: "Usuário não encontrado!"});
        }

        if (user.ehAdmin) {
            return res.status(403).json({ status: false, error: "Não é permitido deletar outro admin!"});
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ status: true, message: "Usuário deletado com sucesso!"});

    }

    catch (error) {
        res.status(500).json({ status: false, error: "Erro ao deletar usuário."});
    }

});

//rota para alteração de dados pessoais (admins podem atualizar dados de outros usuários também)
router.put('/alteraDados/:id', verificarToken, async (req, res) => {

    const { username, senha } = req.body;

    try {
        if (req.user.id !== req.params.id && !req.user.ehAdmin){
            return res.status(403).json({ status: false, error: "Usuários não-admins não podem atualizar dados de outros usuários."});
        }

        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ status: false, error: "Usuário não encontrado."});
        }

        user.username = username || user.username;
        user.senha = senha || user.senha;
        await user.save();

        res.json({ status: true, user});
    }

    catch (error) {
        res.status(500).json({ status: false, error: "Erro ao atualizar dados do usuário."});
    }
});

//rota para verificar o token com post
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

module.exports = {
    router,
    verificarToken,
    verificaAdmin
};
