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

router.use(verificarToken);

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
 *     summary: Lista os melhores filmes
 *     description: Retorna uma lista dos filmes que receberam nota 5.
 *     tags: [Filmes]
 *     responses:
 *       200:
 *         description: Lista de filmes com nota 5 retornada com sucesso.
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
 *                         example: "Inception"
 *                       director:
 *                         type: string
 *                         example: "Christopher Nolan"
 *                       nota:
 *                         type: integer
 *                         example: 5
 *       500:
 *         description: Erro ao listar os melhores filmes.
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
 *                   example: "Erro ao listar os melhores filmes."
 */
router.get("/melhores", async (req, res) => {
    try {
        const melhoresFilmes = await FilmModel.listaMelhores();
        res.json({ status: true, list: melhoresFilmes });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

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
        return res.status(500).json({ status: false, error: error.message });
    }
};

/** 
 * @swagger
 * /api/films/{id}
 *     get:
 *      summary: obter filme pelo seu ID
 *      description: retorna os detalhes de um filme específico obtido pelo seu ID
 *      tags: [Filmes]
 *      parameters: 
 *         - in: path
 *         name: id
 *         required: true
 *         description: o ID do filme a ser pesquisado
 *         schema:
 *           type: string
 *           example: "66da00277075d81206b12fa9"
 *      responses:
 *       200:
 *         description: filme encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 film:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "66da00277075d81206b12fa9"
 *                     movie:
 *                       type: string
 *                       example: "The Wall"
 *                     director:
 *                       type: string
 *                       example: "Alan Parker"
 *                     nota:
 *                       type: integer
 *                       example: 5
 *       404:
 *         description: filme não foi encontrado
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
 *                   example: "filme não encontrado!"
 * 
*/
router.get("/:id", getFilm, (req, res) => {
    res.json({ status: true, film: req.film });
});


//rota para criar um novo filme (somente para admins)
router.post("/", verificaAdmin, validaFilme, async (req, res) => {
    try {
        const novoFilme = await FilmModel.novoFilme(req.movie, req.director, req.nota);
        res.json({ status: true, film: novoFilme });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

//rota para atualizar dados de um filme já existente
router.put("/:id", verificaAdmin, validaFilme, getFilm, async (req, res) => {
    try {
        const filmeAtualizado = await FilmModel.attFilme(req.film.id, req.movie, req.director, req.nota);
        res.json({ status: true, film: filmeAtualizado });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

//rota para deletar um filme pelo seu ID
router.delete("/:id", verificaAdmin, getFilm, async (req, res) => {
    try {
        await FilmModel.deletaFilme(req.params.id);
        res.json({ status: true, oldFilm: req.film });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

module.exports = router;
