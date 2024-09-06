var express = require('express');
var router = express.Router();

var FilmModel = require("../model/films");
var ActorModel = require("../model/actors");
var OscarModel = require("../model/oscars");
var UserModel = require("../model/user");

/**
 * @swagger
 * /:
 *   get:
 *     summary: inicializa o sistema com alguns filmes, atores, prêmios e cria um usuário administrador
 *     description: rota para inicializar alguns elementos do sistema, como alguns filmes, atores e um prêmio, e também um usuário administrador.
 *     tags:
 *       - Configuração
 *     responses:
 *       200:
 *         description: instalação concluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Mensagem de sucesso
 *                   example: "Instalação concluída!"
 *       500:
 *         description: erro durante a instalação
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
 *                   example: "Erro de instalação: [mensagem de erro]"
 */
router.get('/', async (req, res) => {
    try {
        await FilmModel.novoFilme("Forrest Gump", "Robert Zemeckis", 4);
        await FilmModel.novoFilme("Stop Making Sense", "Jonathan Demme", 5);
        await ActorModel.novoAtor("David Byrne", 1952);
        await ActorModel.novoAtor("Tom Hanks", 1956);
        await OscarModel.novoOscar("Melhor Ator", 1995);
        await UserModel.createAdmin();

        res.json({ status: true, message: "Instalação concluída!" });
    } catch (error) {
        res.status(500).json({ status: false, error: "Erro de instalação: " + error.message });
    }
});

module.exports = router;