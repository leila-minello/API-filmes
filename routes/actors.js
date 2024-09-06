var express = require('express');
var router = express.Router();

var ActorModel = require("../model/actors");
var FilmModel = require("../model/films");
var { verificarToken, verificaAdmin } = require("./auth");

//middleware para validar os dados do ator
let validaAtor = (req, res, next) => {
    let { name, birthYear } = req.body;
    const currentYear = new Date().getFullYear();
    
    if (!name || !birthYear) {
        return res.status(400).json({ status: false, error: "O nome e ano de nascimento são obrigatórios!" });
    }
    
    if (isNaN(birthYear) || birthYear > currentYear) {
        return res.status(400).json({ status: false, error: `O ano de nascimento deve ser válido (até ${currentYear}).` });
    }
    
    req.name = name;
    req.birthYear = birthYear;
    next();
}

//middleware para procurar ator por id
let getActor = async (req, res, next) => {
    let id = req.params.id;
    try {
        let actor = await ActorModel.getActorById(id);
        if (!actor) {
            return res.status(404).json({ status: false, error: "Ator não encontrado!" });
        }
        req.actor = actor;
        next();
    } catch (error) {
        return res.status(500).json({ status: false, error: error.message });
    }
};

router.use(verificarToken);

//ROTAS ACTOR.JS

/**
 * @swagger
 * /api/actors:
 *   get:
 *     summary: lista os atores com paginação
 *     description: retorna uma lista de atores utilizando paginação
 *     tags: [Atores]
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 5
 *           description: número máximo de atores por página (10)
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *           description: número da página atual
 *     responses:
 *       200:
 *         description: lista de atores recuperada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: status da operação
 *                 list:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID do ator
 *                       name:
 *                         type: string
 *                         description: Nome do ator
 *                         example: "Emma Stone"
 *                       birthdate:
 *                         type: string
 *                         format: date
 *                         description: Data de nascimento do ator
 *                         example: 1988
 *       500:
 *         description: erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: status da operação
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: erro de servidor!!
 */
router.get("/", async (req, res) => {
    let { limite = 5, pagina = 1 } = req.query;

    limite = Math.min(Math.max(parseInt(limite), 1), 10);
    pagina = Math.max(parseInt(pagina), 1);

    try {
        const atores = await ActorModel.listaPag(limite, pagina);
        res.json({ status: true, list: atores });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});


/**
 * @swagger
 * /api/actors/{id}:
 *   get:
 *     summary: obtem um ator pelo ID
 *     description: retorna os detalhes de um ator específico com base em seu ID
 *     tags:
 *       - Atores
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do ator que você deseja recuperar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ator recuperado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: status da operação
 *                 actor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID do ator
 *                     name:
 *                       type: string
 *                       description: Nome do ator
 *                       example: "Julia Roberts"
 *                     birthYear:
 *                       type: integer
 *                       description: Ano de nascimento do ator
 *                       example: "1967"
 *       404:
 *         description: ator não encontrado
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
 *                   example: "ator não encontrado!"
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
router.get("/:id", getActor, (req, res) => {
    res.json({ status: true, actor: req.actor });
});

/**
 * @swagger
 * /api/actors:
 *   post:
 *     summary: cria um novo ator
 *     description: permite a criação de um novo registro de filme (apenas admins)
 *     tags:
 *       - Atores
 *     security:
 *       - bearerAuth: [] # Indica que a autenticação JWT é necessária
 *     requestBody:
 *       description: dados do novo registro que será criado
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - birthYear
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do ator
 *                 example: "Bob Geldof"
 *               birthYear:
 *                 type: integer
 *                 description: Ano de nascimento do ator
 *                 example: 1951
 *     responses:
 *       200:
 *         description: ator criado com sucesso!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                 actor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID do ator
 *                     name:
 *                       type: string
 *                       description: Nome do ator
 *                       example: "Bob Geldof"
 *                     birthYear:
 *                       type: integer
 *                       description: Ano de nascimento do ator
 *                       example: 1951
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
router.post("/", verificaAdmin, validaAtor, async (req, res) => {
    try {
        const novoAtor = await ActorModel.novoAtor(req.name, req.birthYear);
        res.json({ status: true, actor: novoAtor });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /api/actors/{id}:
 *   put:
 *     summary: atualiza dados de um ator existente
 *     description: atualiza os dados de um ator existente (somente admins)
 *     tags:
 *       - Atores
 *     security:
 *       - bearerAuth: [] # Indica que a autenticação JWT é necessária
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do ator que você deseja atualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       description: dados atualizados do ator
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - birthYear
 *             properties:
 *               name:
 *                 type: string
 *                 description: Novo nome do ator
 *                 example: "Robert Geldof"
 *               birthYear:
 *                 type: integer
 *                 description: Novo ano de nascimento do ator
 *                 example: 1951
 *     responses:
 *       200:
 *         description: Ator atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                 actor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID do ator
 *                     name:
 *                       type: string
 *                       description: Nome do ator atualizado
 *                       example: "Robert Geldof"
 *                     birthYear:
 *                       type: integer
 *                       description: Ano de nascimento do ator atualizado
 *                       example: 1951
 *       404:
 *         description: ator não encontrado
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
 *                   example: ator não encontrado!
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
router.put("/:id", verificaAdmin, validaAtor, async (req, res) => {
    try {
        const atorAtualizado = await ActorModel.attAtor(req.params.id, req.name, req.birthYear);
        res.json({ status: true, actor: atorAtualizado });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /api/actors/{id}:
 *   delete:
 *     summary: deleta um ator pelo ID
 *     description: deleta um ator existente do banco de dados com base no seu ID (somente admins)
 *     tags:
 *       - Atores
 *     security:
 *       - bearerAuth: [] # Indica que a autenticação JWT é necessária
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do ator que você deseja deletar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ator deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                 oldActor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID do ator deletado
 *                     name:
 *                       type: string
 *                       description: Nome do ator deletado
 *                     birthYear:
 *                       type: integer
 *                       description: Ano de nascimento do ator deletado
 *       404:
 *         description: ator não encontrado
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
 *                   example: ator não encontrado!
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
router.delete("/:id", verificaAdmin, getActor, async (req, res) => {
    try {
        await ActorModel.deletaAtor(req.params.id);
        res.json({ status: true, oldActor: req.actor });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /api/actors/{actorId}/films/{filmId}:
 *   post:
 *     summary: associa um filme já logado a um ator
 *     description: associa um filme já logado com um dos atores, indicando a participação do ator no filme (somente admins)
 *     tags:
 *       - Atores
 *     security:
 *       - bearerAuth: [] # Indica que a autenticação JWT é necessária
 *     parameters:
 *       - in: path
 *         name: actorId
 *         required: true
 *         description: ID do ator que você deseja associar ao filme
 *         schema:
 *           type: string
 *       - in: path
 *         name: filmId
 *         required: true
 *         description: ID do filme ao qual o ator será associado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: filme associado com sucesso ao ator
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                 actor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID do ator associado
 *                     name:
 *                       type: string
 *                       description: Nome do ator associado
 *                       example: "David Byrne"
 *                     birthYear:
 *                       type: integer
 *                       description: Ano de nascimento do ator associado
 *                       example: 1952
 *       404:
 *         description: ator ou filme não encontrado
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
 *                   example: Ator e/ou filme não foi/foram encontrado(s)!
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
router.post("/:actorId/films/:filmId", verificaAdmin, async (req, res) => {
    try {
        let actor = await ActorModel.filmePraAtor(req.params.actorId, req.params.filmId);

        if (!actor) {
            return res.status(404).json({ status: false, error: "Ator não encontrado!" });
        }

        let film = await FilmModel.getFilmById(req.params.filmId);

        if (!film) {
            return res.status(404).json({ status: false, error: "Filme não encontrado!" });
        }

        film.actors = film.actors || [];
        if (!film.actors.includes(req.params.actorId)) {
            film.actors.push(req.params.actorId);
        }

        await film.save();
        res.json({ status: true, actor });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

module.exports = router;
