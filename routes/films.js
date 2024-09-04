var express = require('express');
var router = express.Router();

var FilmModel = require("../model/films");
var { verificarToken, verificaAdmin } = require("./auth");

//middleware para procurar filme por id
let getFilm = (req, res, next) => {
    let id = req.params.id;
    let obj = FilmModel.getElementById(id);
    if (obj == null) {
        return res.status(404).json({ status: false, error: "Filme não encontrado!" });
    }
    req.film = obj;
    next();
};

//middleware para validar os dados do filme
let validaFilme = (req, res, next) => {
    let { movie, director } = req.body;
    if (!movie || !director) {
        return res.status(400).json({ status: false, error: "O título do filme, o diretor e a nota são obrigatórios!" });
    }

    if (director.length < 3) {
        return res.status(400).json({ status: false, error: "O nome do diretor deve ter mais de 3 caracteres." });
    }

    if (nota < 1 || nota > 5) {
        return res.status(400).json({status: false, error: "A nota deve ser um valor entre 1 e 5."})
    }

    req.movie = movie;
    req.director = director;
    req.nota = nota;
    next();
};

router.use(verificarToken);

//rota para listar filmes com paginação
router.get("/", (req, res) => {
    let { limite = 5, pagina = 1 } = req.query;

    limite = Math.min(Math.max(parseInt(limite), 1), 20);
    pagina = Math.max(parseInt(pagina), 1);

    const filmes = FilmModel.listPaginated(limite, pagina);
    res.json({ status: true, list: filmes });
});

//rota para lista de melhores filmes (filmes com nota 5 atribuída)
router.get("/melhores", (req, res) => {
    const melhoresFilmes = FilmModel.listMelhores();
    res.json({status: true, film: req.film});
});


//rota para obter filme por ID
router.get("/:id", getFilm, (req, res) => {
    res.json({ status: true, film: req.film });
});

//rota para criar novo filme (somente admins)
router.post("/", verificaAdmin, validaFilme, (req, res) => {
    res.json({ status: true, film: FilmModel.new(req.movie, req.director, req.nota) });
});

//rota para atualizar um filme existente
router.put("/:id", verificaAdmin, validaFilme, getFilm, (req, res) => {
    res.json({ status: true, film: FilmModel.update(req.film.id, req.movie, req.director, req.nota) });
});

//rota para deletar um filme pelo ID
router.delete("/:id", verificaAdmin, getFilm, (req, res) => {
    FilmModel.delete(req.params.id);
    res.json({ status: true, oldFilm: req.film });
});

module.exports = router;
