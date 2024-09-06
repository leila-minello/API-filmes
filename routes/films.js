var express = require('express');
var router = express.Router();

var FilmModel = require("../model/films");
var { verificarToken, verificaAdmin } = require("./auth");

//middleware para validar os dados do filme
let validaFilme = (req, res, next) => {
    let { movie, director, nota } = req.body;
    if (!movie || !director) {
        return res.status(400).json({ status: false, error: "O título do filme, o diretor e a nota são obrigatórios!" });
    }

    //especificação para nome do diretor
    if (director.length < 3) {
        return res.status(400).json({ status: false, error: "O nome do diretor deve ter mais de 3 caracteres." });
    }
    
    //especificação para nota
    if (nota < 1 || nota > 5) {
        return res.status(400).json({status: false, error: "A nota deve ser um valor entre 1 e 5."})
    }
    
    req.movie = movie;
    req.director = director;
    req.nota = nota;
    next();
};

//middleware para procurar filme por id
let getFilm = async (req, res, next) => {
    let id = req.params.id;
    try {
        let film = await FilmModel.getFilmById(id);
        if (!film) {
            return res.status(404).json({ status: false, error: "Filme não encontrado!" });
        }
        req.film = film;
        next();
    } catch (error) {
        return res.status(500).json({ status: false, error: "Erro no sistema!" });
    }
};

router.use(verificarToken);

//ROTAS FILMS.JS

/**
 * @swagger
 * /api/films:
 *   get:
 *     summary: lista filmes com paginação
 *     description: retorna uma lista de filmes utilizando paginação
 *     tags: [Filmes]
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 5
 *           description: número máximo de filmes por página (10)
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *           description: número da página atual
 *     responses:
 *       200:
 *         description: lista de filmes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 list:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "66da00277075d81206b12fa9"
 *                       movie:
 *                         type: string
 *                         example: "The Wall"
 *                       director:
 *                         type: string
 *                         example: "Alan Parker"
 *                       nota:
 *                         type: integer
 *                         example: 5
 *       500:
 *         description: erro ao gerar a listagem paginada dos filmes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Não foi possível gerar a listagem paginada dos filmes!"
 */
router.get("/", async (req, res) => {
    let { limite = 5, pagina = 1 } = req.query;
    
    limite = Math.min(Math.max(parseInt(limite), 1), 10);
    pagina = Math.max(parseInt(pagina), 1);

    try {
        const filmes = await FilmModel.listaPag(limite, pagina);
        res.json({ status: true, list: filmes });
    } catch (error) {
        res.status(500).json({ status: false, error: "Não foi possível gerar fazer a listagem paginada dos filmes." });
    }
});

/**
 * @swagger
 * /api/films/melhores:
 *   get:
 *     summary: lista os melhores filmes (nota 5)
 *     description: retorna uma lista dos filmes que receberam nota 5
 *     tags: [Filmes]
 *     responses:
 *       200:
 *         description: sucesso ao retornar a lista de melhores filmes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 list:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "64e5ac7d5432d9bf0348afdc"
 *                       movie:
 *                         type: string
 *                         example: "The Wall"
 *                       director:
 *                         type: string
 *                         example: "Alan Parker"
 *                       nota:
 *                         type: integer
 *                         example: 5
 *       500:
 *         description: erro ao listar os melhores filmes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "erro ao listar os melhores filmes!"
 */
router.get("/melhores", async (req, res) => {
    try {
        const melhoresFilmes = await FilmModel.listaMelhores();
        res.json({ status: true, list: melhoresFilmes });
    } catch (error) {
        res.status(500).json({ status: false, error: "Erro no sistema!" });
    }
});

/**
 * @swagger
 * /api/films/{id}:
 *   get:
 *     summary: obtem um filme pelo ID
 *     description: retorna os detalhes de um filme específico com base em seu ID
 *     tags:
 *       - Filmes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do filme que você deseja recuperar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: filme recuperado com sucesso!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: status da operação
 *                 film:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID do filme
 *                     movie:
 *                       type: string
 *                       description: título do filme
 *                       example: "Click"
 *                     director:
 *                       type: string
 *                       description: diretor do filme
 *                       example: "Frank Coraci"
 *                     nota:
 *                       type: number
 *                       description: nota do filme
 *                       example: 3
 *       404:
 *         description: filme não encontrado
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
 *                   description: mensagem de erro
 *                   example: Filme não encontrado!
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
 *                   description: mensagem de erro
 *                   example: erro no servidor
 */
router.get("/:id", getFilm, (req, res) => {
    res.json({ status: true, film: req.film });
});

/**
 * @swagger
 * /api/films:
 *   post:
 *     summary: cria um novo filme
 *     description: permite a criação de um novo registro de filme (apenas admins)
 *     tags:
 *       - Filmes
 *     security:
 *       - bearerAuth: [] # indica que a autenticação JWT é necessária
 *     requestBody:
 *       description: dados do novo registro que será criado
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movie
 *               - director
 *               - nota
 *             properties:
 *               movie:
 *                 type: string
 *                 description: título do filme
 *                 example: "Stop Making Sense" 
 *               director:
 *                 type: string
 *                 description: diretor do filme
 *                 example: "Jonathan Demme"
 *               nota:
 *                 type: number
 *                 description: nota do filme (máximo 5, mínimo 1)
 *                 example: 5
 *     responses:
 *       200:
 *         description: filme criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: status da operação
 *                 film:
 *                   type: object
 *                   properties:
 *                     movie:
 *                       type: string
 *                       description: título do filme
 *                     director:
 *                       type: string
 *                       description: diretor do filme
 *                     nota:
 *                       type: number
 *                       description: nota do filme
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
 *                 error:
 *                   type: string
 *                   description: mensagem de erro
 */
router.post("/", verificaAdmin, validaFilme, async (req, res) => {
    try {
        const novoFilme = await FilmModel.novoFilme(req.movie, req.director, req.nota);
        res.json({ status: true, film: novoFilme });
    } catch (error) {
        res.status(500).json({ status: false, error: "Erro no sistema!" });
    }
});

/**
 * @swagger
 * api/films/{id}:
 *   put:
 *     summary: atualiza dados de um filme existente
 *     description: atualiza os dados de um filme existente (somente admins)
 *     tags:
 *       - Filmes
 *     security:
 *       - bearerAuth: [] # Indica que a autenticação JWT é necessária
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do filme que você deseja atualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       description: dados atualizados do filme
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movie
 *               - director
 *               - nota
 *             properties:
 *               movie:
 *                 type: string
 *                 description: nome atualizado
 *                 example: "The Wall - *Pink Floyd*"
 *               director:
 *                 type: string
 *                 description: diretor atualizado
 *                 example: "Alan Parker"
 *               nota:
 *                 type: number
 *                 description: nota atualizada
 *                 example: 5
 *     responses:
 *       200:
 *         description: filme atualizado com sucesso!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: status da operação
 *                 film:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID do filme
 *                     movie:
 *                       type: string
 *                       description: novo título do filme
 *                       example: "The Wall - Pink Floyd"
 *                     director:
 *                       type: string
 *                       description: novo diretor
 *                       example: "Alan Parker"
 *                     nota:
 *                       type: number
 *                       description: nota atualizada
 *                       example: 5
 *       404:
 *         description: filme não encontrado!
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
 *                   description: mensagem de erro
 *                   example: filme não encontrado!
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
 *                   description: erro no servidor!
 */
router.put("/:id", verificaAdmin, validaFilme, getFilm, async (req, res) => {
    try {
        const filmeAtualizado = await FilmModel.attFilme(req.film.id, req.movie, req.director, req.nota);
        res.json({ status: true, film: filmeAtualizado });
    } catch (error) {
        res.status(500).json({ status: false, error: "Erro no sistema!" });
    }
});

/**
 * @swagger
 * api/films/{id}:
 *   delete:
 *     summary: deleta um filme pelo seu ID
 *     description: deleta um filme existente do banco de dados com base no seu ID (somente admins)
 *     tags:
 *       - Filmes
 *     security:
 *       - bearerAuth: [] # Indica que a autenticação JWT é necessária
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do filme que você deseja deletar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: filme deletado com sucesso!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: status da operação
 *                 oldFilm:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID do filme deletado
 *                     movie:
 *                       type: string
 *                       description: Título do filme deletado
 *                     director:
 *                       type: string
 *                       description: Diretor do filme deletado
 *                     nota:
 *                       type: number
 *                       description: Nota do filme deletado
 *       404:
 *         description: filme não encontrado!
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
 *                   description: mensagem de erro
 *                   example: filme não encontrado!
 *       500:
 *         description: erro interno do servidor!
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
 *                   description: mensagem de erro
 *                   example: erro de servidor!
 */
router.delete("/:id", verificaAdmin, getFilm, async (req, res) => {
    try {
        await FilmModel.deletaFilme(req.params.id);
        res.json({ status: true, oldFilm: req.film });
    } catch (error) {
        res.status(500).json({ status: false, error: "Erro no sistema!" });
    }
});

module.exports = router;
