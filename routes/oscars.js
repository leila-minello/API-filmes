var express = require('express');
var router = express.Router();

var OscarModel = require("../model/oscars");
var FilmModel = require("../model/films");
var ActorModel = require("../model/actors");
var { verificarToken, verificaAdmin } = require("./auth");

//middleware para validar os dados do oscar
let validaOscar = (req, res, next) => {
    let { nomePremio, anoRecebimento } = req.body;
    const currentYear = new Date().getFullYear();

    if (!nomePremio || !anoRecebimento) {
        return res.status(400).json({ status: false, error: "O nome do prêmio e o ano de recebimento são obrigatórios!" });
    }

    if (isNaN(anoRecebimento) || anoRecebimento > currentYear) {
        return res.status(400).json({ status: false, error: `O ano de recebimento deve ser válido (até ${currentYear}).` });
    }

    req.nomePremio = nomePremio;
    req.anoRecebimento = anoRecebimento;
    next();
}

//middleware pra procurar prêmio por id
let getOscar = async (req, res, next) => {
    let id = req.params.id;
    try {
        let oscar = await OscarModel.getOscarById(id);
        if (!oscar) {
            return res.status(404).json({ status: false, error: "Oscar não encontrado!" });
        }
        req.oscar = oscar;
        next();
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
}

router.use(verificarToken);

//ROTAS OSCARS.JS

/**
 * @swagger
 * /:
 *   get:
 *     summary: lista prêmios com paginação
 *     description: retorna uma lista de prêmios utilizando paginação
 *     tags: [Oscars]
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 5
 *           description: número máximo de prêmios por página (10)
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *           description: número da página atual
 *     responses:
 *       200:
 *         description: lista de prêmios retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: true
 *                 list:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID do prêmio
 *                       nomePremio:
 *                         type: string
 *                         description: Nome do prêmio
 *                         example: "Melhor Ator"
 *                       anoRecebimento:
 *                         type: integer
 *                         description: Ano em que o prêmio foi recebido
 *                         example: 1995
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
 *                   example: "Não foi possível gerar a listagem paginada dos prêmios!"
 */
router.get("/", async (req, res) => {
    let { limite = 5, pagina = 1 } = req.query;

    limite = Math.min(Math.max(parseInt(limite), 1), 10);
    pagina = Math.max(parseInt(pagina), 1);

    try {
        const oscars = await OscarModel.listaPaginada(limite, pagina);
        res.json({ status: true, list: oscars });
    } catch (error) {
        res.status(500).json({ status: false, error: "Não foi possível gerar fazer a listagem paginada dos filmes." });
    }
});


/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: obtem um prêmio pelo ID
 *     description: retorna os detalhes de um prêmio específico com base em seu ID
 *     tags:
 *       - Oscars
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do prêmio a ser retornado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: detalhes do prêmio retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: true
 *                 oscar:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID do prêmio
 *                     nomePremio:
 *                       type: string
 *                       description: Nome do prêmio
 *                       example: "Melhor Ator"
 *                     anoRecebimento:
 *                       type: integer
 *                       description: Ano em que o prêmio foi recebido
 *                       example: 1995
 *       404:
 *         description: prêmio não encontrado
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
 *                   example: Oscar não encontrado!
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
 *                   example: Erro do servidor!
 */
router.get("/:id", getOscar, (req, res) => {
    res.json({ status: true, oscar: req.oscar });
});

/**
 * @swagger
 * /:
 *   post:
 *     summary: cria um novo prêmio
 *     description: permite a criação de um novo registro de prêmio (apenas admins)
 *     tags:
 *       - Oscars
 *     security:
 *       - bearerAuth: [] # Indica que a autenticação JWT é necessária
 *     requestBody:
 *       description: dados do novo registro a ser criado
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nomePremio
 *               - anoRecebimento
 *             properties:
 *               nomePremio:
 *                 type: string
 *                 description: Nome do prêmio
 *                 example: "Melhor Ator"
 *               anoRecebimento:
 *                 type: integer
 *                 description: Ano em que o prêmio foi recebido
 *                 example: 1995
 *     responses:
 *       201:
 *         description: prêmio criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: true
 *                 oscar:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID do prêmio criado
 *                       example: "(ID do prêmio aqui)"
 *                     nomePremio:
 *                       type: string
 *                       description: Nome do prêmio
 *                       example: "Melhor Ator"
 *                     anoRecebimento:
 *                       type: integer
 *                       description: Ano em que o prêmio foi recebido
 *                       example: 1995
 *       403:
 *         description: falta de permissões de admin para criar o prêmio
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
 *                   example: "Acesso negado! Apenas administradores podem criar prêmios."
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
 *                   example: "Erro ao criar prêmio."
 */
router.post("/", verificaAdmin, validaOscar, async (req, res) => {
    try {
        const oscar = await OscarModel.novoOscar(req.nomePremio, req.anoRecebimento);
        res.json({ status: true, oscar });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: atualiza dados de um prêmio existente
 *     description: atualiza os dados de um prêmio existente (somente admins)
 *     tags:
 *       - Oscars
 *     security:
 *       - bearerAuth: [] # Indica que a autenticação JWT é necessária
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do prêmio a ser atualizado
 *         schema:
 *           type: string
 *     requestBody:
 *       description: dados para atualização do prêmio
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nomePremio
 *               - anoRecebimento
 *             properties:
 *               nomePremio:
 *                 type: string
 *                 description: Nome do prêmio
 *                 example: "Melhor Atriz"
 *               anoRecebimento:
 *                 type: integer
 *                 description: Ano em que o prêmio foi recebido
 *                 example: 1995
 *     responses:
 *       200:
 *         description: prêmio atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: true
 *                 oscar:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID do prêmio atualizado
 *                       example: (ID do prêmio aqui)
 *                     nomePremio:
 *                       type: string
 *                       description: Nome do prêmio
 *                       example: "Melhor Atriz"
 *                     anoRecebimento:
 *                       type: integer
 *                       description: Ano em que o prêmio foi recebido
 *                       example: 1995
 *       403:
 *         description: falta de permissões para atualizar o prêmio
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
 *                   example: "Acesso negado! Apenas administradores podem atualizar prêmios."
 *       404:
 *         description: prêmio não encontrado
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
 *                   example: "Oscar não encontrado!"
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
 *                   example: "Erro no sistema."
 */
router.put("/:id", verificaAdmin, validaOscar, getOscar, async (req, res) => {
    try {
        const oscar = await OscarModel.attOscar(req.params.id, req.nomePremio, req.anoRecebimento);
        res.json({ status: true, oscar });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: deleta um prêmio pelo ID
 *     description: deleta um prêmio existente do banco de dados com base no seu ID (somente admins)
 *     tags:
 *       - Oscars
 *     security:
 *       - bearerAuth: [] # Indica que a autenticação JWT é necessária
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do prêmio a ser deletado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: prêmio deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: true
 *                 oldOscar:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID do prêmio deletado
 *                       example: "(ID do prêmio aqui)"
 *                     nomePremio:
 *                       type: string
 *                       description: Nome do prêmio
 *                       example: "Melhor ator"
 *                     anoRecebimento:
 *                       type: integer
 *                       description: Ano em que o prêmio foi recebido
 *                       example: 1995
 *       403:
 *         description: falta de permissões para deletar o prêmio
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
 *                   example: "Acesso negado! Apenas administradores podem deletar prêmios."
 *       404:
 *         description: prêmio não encontrado
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
 *                   example: "Oscar não encontrado!"
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
 *                   example: "Erro no sistema."
 */
router.delete("/:id", verificaAdmin, getOscar, async (req, res) => {
    try {
        await OscarModel.deletaOscar(req.params.id);
        res.json({ status: true, oldOscar: req.oscar });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /{oscarId}/films/{filmId}:
 *   post:
 *     summary: associa um filme a um prêmio
 *     description: associa um filme já logado a um prêmio com base em seus IDs.
 *     tags:
 *       - Oscars
 *     security:
 *       - bearerAuth: [] # Indica que a autenticação JWT é necessária
 *     parameters:
 *       - in: path
 *         name: oscarId
 *         required: true
 *         description: ID do prêmio ao qual o filme será associado
 *         example: (ID do prêmio aqui)
 *         schema:
 *           type: string
 *       - in: path
 *         name: filmId
 *         required: true
 *         description: ID do filme a ser associado
 *         example: (ID do filme aqui)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: filme associado ao prêmio com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: true
 *                 oscar:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID do prêmio associado
 *                       example: (ID do prêmio aqui)
 *                     nomePremio:
 *                       type: string
 *                       description: Nome do prêmio
 *                       example: "Melhor Ator"
 *                     anoRecebimento:
 *                       type: integer
 *                       description: Ano em que o prêmio foi recebido
 *                       example: 1995
 *       404:
 *         description: prêmio ou filme não encontrado
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
 *                   example: "Oscar ou filme não encontrado!"
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
 *                   example: "Erro ao associar filme ao prêmio."
 */
router.post("/:oscarId/films/:filmId", verificaAdmin, async (req, res) => {
    try {
        let oscar = await OscarModel.filmeParaOscar(req.params.oscarId, req.params.filmId);
        if (!oscar) {
            return res.status(404).json({ status: false, error: "Oscar não encontrado!" });
        }

        let film = await FilmModel.getFilmById(req.params.filmId);
        if (!film) {
            return res.status(404).json({ status: false, error: "Filme não encontrado!" });
        }

        res.json({ status: true, oscar });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

/**
 * @swagger
 * /{oscarId}/actors/{actorId}:
 *   post:
 *     summary: associa um ator a um prêmio
 *     description: associa um ator já logado a um prêmio com base em seus IDs.
 *     tags:
 *       - Oscars
 *     security:
 *       - bearerAuth: [] # Indica que a autenticação JWT é necessária
 *     parameters:
 *       - in: path
 *         name: oscarId
 *         required: true
 *         description: ID do prêmio ao qual o ator será associado
 *         example: (ID do prêmio aqui)
 *         schema:
 *           type: string
 *       - in: path
 *         name: actorId
 *         required: true
 *         description: ID do ator a ser associado
 *         example: (ID do ator aqui)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ator associado ao prêmio com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Status da operação
 *                   example: true
 *                 oscar:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID do prêmio associado
 *                       example: (ID do prêmio aqui)
 *                     nomePremio:
 *                       type: string
 *                       description: Nome do prêmio
 *                       example: "Melhor Ator"
 *                     anoRecebimento:
 *                       type: integer
 *                       description: Ano em que o prêmio foi recebido
 *                       example: 1995
 *       404:
 *         description: prêmio ou ator não encontrado
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
 *                   example: "Oscar ou ator não encontrado!"
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
 *                   example: "Erro ao associar ator ao prêmio."
 */
router.post("/:oscarId/actors/:actorId", verificaAdmin, async (req, res) => {
    try {
        let oscar = await OscarModel.atorParaOscar(req.params.oscarId, req.params.actorId);
        if (!oscar) {
            return res.status(404).json({ status: false, error: "Oscar não encontrado!" });
        }

        let actor = await ActorModel.getActorById(req.params.actorId);
        if (!actor) {
            return res.status(404).json({ status: false, error: "Ator não encontrado!" });
        }

        res.json({ status: true, oscar });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

module.exports = router;
