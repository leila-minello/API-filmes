var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();

const User = require("../model/user");

const chave = 'PF14071982'; 

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

/**
 * @swagger
 * /login:
 *   post:
 *     summary: realiza o login do usuário
 *     description: autentica o usuário por meio de um username e senha e retorna um token JWT para acesso futuro
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       description: dados de login do usuário
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - senha
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nome de usuário
 *                 example: "admCartaCaixa"
 *               senha:
 *                 type: string
 *                 description: Senha do usuário
 *                 example: "adm1902"
 *     responses:
 *       200:
 *         description: login bem-sucedido e token retornado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                 message:
 *                   type: string
 *                   description: Mensagem de sucesso
 *                   example: "LOG DE FILMES ABERTO"
 *                 token:
 *                   type: string
 *                   description: Token JWT gerado
 *                   example: "(seu token aqui)"
 *       401:
 *         description: credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *                   example: "login inválido! username ou senha errados."
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *                   example: erro de servidor!
 */
router.post('/login', async (req, res) => {
    const { username, senha } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || user.senha !== senha) {
            return res.status(401).json({ status: false, error: 'Login inválido! User ou senha errados.' });
        }

        const token = jwt.sign({ message: 'LOG DE FILMES ABERTO', id: user._id, ehAdmin: user.ehAdmin }, chave, { expiresIn: '1h' });
        res.json({ status: true, message: 'LOG DE FILMES ABERTO', token: token });

    } catch (error) {
        res.status(500).json({ status: false, error: 'Erro na autenticação, tente novamente.' });
    }
});

/**
 * @swagger
 * /registro:
 *   post:
 *     summary: cadastra um novo usuário
 *     description: cadastra um novo usuário no sistema com suas informações (username e senha e indicação de permissão de adm)
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       description: dados para registro do novo usuário
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - senha
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nome de usuário
 *                 example: "admCartaCaixa"
 *               senha:
 *                 type: string
 *                 description: Senha do usuário
 *                 example: "adm1902"
 *               ehAdmin:
 *                 type: boolean
 *                 description: indica permissão de adm pro usuário
 *                 example: true
 * 
 *     responses:
 *       201:
 *         description: usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID do usuário
 *                       example: "(seu ID aqui)"
 *                     username:
 *                       type: string
 *                       description: Nome de usuário
 *                       example: "admCartaCaixa"
 *                     ehAdmin:
 *                       type: boolean
 *                       description: Se o usuário é um administrador
 *       400:
 *         description: usuário já existente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *                   example: esse username já foi registrado.
 *       500:
 *         description: erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *                   example: erro de servidor!
 */
router.post('/registro', async (req, res) => {
    const { username, senha, ehAdmin } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ status: false, error: 'Usuário já existente.' });
        }

        user = new User({ username, senha, ehAdmin });
        await user.save();

        res.status(201).json({ status: true, user: user });
    } catch (error) {
        console.error('Erro detalhado:', error);
        res.status(500).json({ status: false, error: 'Erro ao criar usuário!' });
    }
});

/**
 * @swagger
 * /criaAdm:
 *   post:
 *     summary: cria um novo administrador
 *     description: permite a criação de um novo admin por um admin já existente
 *     tags:
 *       - Autenticação
 *     security:
 *       - bearerAuth: [] # Indica que a autenticação JWT é necessária
 *     requestBody:
 *       description: dados para criação do novo administrador
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - senha
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nome de usuário
 *                 example: "nvAdmCartaCaixa"
 *               senha:
 *                 type: string
 *                 description: Senha do usuário
 *                 example: "nvAdm1902"
 *     responses:
 *       201:
 *         description: novo administrador criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID do administrador
 *                       example: "(seu ID aqui)"
 *                     username:
 *                       type: string
 *                       description: Nome de usuário
 *                       example: "nvAdmCartaCaixa"
 *                     ehAdmin:
 *                       type: boolean
 *                       description: Se o usuário é um administrador
 *                       example: true
 *       400:
 *         description: usuário já existente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *                   example: "esse username já foi registrado."
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *                   example: erro de servidor!
 */
router.post('/criaAdm', verificarToken, verificaAdmin, async (req, res) => {
    const { username, senha } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ status: false, error: "Já existe usuário com esse username." });
        }

        const novoAdm = new User({ username, senha, ehAdmin: true });
        await novoAdm.save();

        res.status(201).json({ status: true, user: novoAdm });
    } catch (error) {
        res.status(500).json({ status: false, error: "Erro ao criar o administrador!" });
    }
});

/**
 * @swagger
 * /deletaUser/{id}:
 *   delete:
 *     summary: deleta um usuário pelo seu ID
 *     description: deleta um usuário do sistema por meio de seu ID (apenas admins)
 *     tags:
 *       - Autenticação
 *     security:
 *       - bearerAuth: [] # Indica que a autenticação JWT é necessária
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário a ser deletado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: usuário deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                 message:
 *                   type: string
 *                   description: Mensagem de sucesso
 *                   example: "Usuário deletado com sucesso!"
 *       403:
 *         description: tentativa de excluir um administrador ou falta de permissões de admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *                   example: Não é permitido deletar outro admin!
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *                   example: Usuário não encontrado!
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *                   example: erro de servidor!
 */
router.delete('/deletaUser/:id', verificarToken, verificaAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ status: false, error: "Usuário não encontrado!" });
        }

        if (user.ehAdmin) {
            return res.status(403).json({ status: false, error: "Não é permitido deletar outro admin!" });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ status: true, message: "Usuário deletado com sucesso!" });

    } catch (error) {
        res.status(500).json({ status: false, error: "Erro ao deletar usuário." });
    }
});

/**
 * @swagger
 * /alteraDados/{id}:
 *   put:
 *     summary: atualiza dados pessoais do usuário
 *     description: atualiza os dados de um usuário por meio de seu ID. (somente admins)
 *     tags:
 *       - Autenticação
 *     security:
 *       - bearerAuth: [] # Indica que a autenticação JWT é necessária
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário a ser atualizado
 *         schema:
 *           type: string
 *     requestBody:
 *       description: dados para atualização do usuário
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Novo nome de usuário
 *                 example: "nvNomeCartaCaixa"
 *               senha:
 *                 type: string
 *                 description: Nova senha
 *                 example: "nvSenha1902"
 *     responses:
 *       200:
 *         description: dados do usuário atualizados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID do usuário atualizado
 *                     username:
 *                       type: string
 *                       description: Nome de usuário atualizado
 *                     message:
 *                      type: string
 *                      description: Mensagem de sucesso
 *                      example: "Usuário atualizado com sucesso!"
 *       403:
 *         description: usuário não autorizado a atualizar dados de outros usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *                   example: "Usuários não-admins não podem atualizar dados de outros usuários.""
 *       404:
 *         description: usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *                   example: "Usuário não encontrado."
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *                   example: "erro de servidor!"
 */
router.put('/alteraDados/:id', verificarToken, async (req, res) => {
    const { username, senha } = req.body;

    try {
        if (req.user.id !== req.params.id && !req.user.ehAdmin) {
            return res.status(403).json({ status: false, error: "Usuários não-admins não podem atualizar dados de outros usuários." });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ status: false, error: "Usuário não encontrado." });
        }

        user.username = username || user.username;
        user.senha = senha || user.senha;
        await user.save();
        res.json({ status: true, message: "Usuário atualizado com sucesso!" });

        res.json({ status: true, user });
    } catch (error) {
        res.status(500).json({ status: false, error: "Erro ao atualizar dados do usuário." });
    }
});

/**
 * @swagger
 * /verificaToken:
 *   post:
 *     summary: verifica o token JWT para login
 *     description: verifica a validade de um token JWT fornecido
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       description: token JWT a ser verificado
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token JWT a ser verificado
 *                 example: "(seu token aqui)"
 *     responses:
 *       200:
 *         description: token verificado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                 message:
 *                   type: string
 *                   description: Mensagem de sucesso
 *                   example: "Token validado!"
 *       400:
 *         description: token não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *                   example: "É obrigatório inserir token!"
 *       401:
 *         description: token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Mensagem de erro
 *                   example: "O token é inválido ou já expirou"
 */
router.post('/verificaToken', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ status: false, error: 'É obrigatório inserir token!' });
    }

    try {
        const decoded = jwt.verify(token, chave);
        res.json({ status: true, message: "Token validado!" });
    } catch (error) {
        res.status(401).json({ status: false, error: 'O token é inválido ou já expirou' });
    }
});



module.exports = {
    router,
    verificarToken,
    verificaAdmin
};
