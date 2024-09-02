var express = require('express');
var router = express.Router();

var FilmModel = require("../model/films");

// Middleware para obter um filme pelo ID
let getFilm = (req, res, next) => {
    let id = req.params.id;
    let obj = FilmModel.getElementById(id);
    if (obj == null) {
        return res.status(404).json({ status: false, error: "Filme não encontrado" });
    }
    req.film = obj;
    next();
};

// Middleware para validar os dados do filme
let validateFilmData = (req, res, next) => {
    let { movie, director } = req.body;
    if (!movie || !director) {
        return res.status(400).json({ status: false, error: "O título do filme e o diretor são obrigatórios" });
    }

    if (director.length < 3) {
        return res.status(400).json({ status: false, error: "O nome do diretor deve ter mais de 3 caracteres" });
    }

    req.movie = movie;
    req.director = director;
    next();
};

// Rota para listar todos os filmes
router.get("/", (req, res) => {
    res.json({ status: true, list: FilmModel.list() });
});

// Rota para obter um filme pelo ID
router.get("/:id", getFilm, (req, res) => {
    res.json({ status: true, film: req.film });
});

// Rota para criar um novo filme
router.post("/", validateFilmData, (req, res) => {
    res.json({ status: true, film: FilmModel.new(req.movie, req.director) });
});

// Rota para atualizar um filme existente
router.put("/:id", validateFilmData, getFilm, (req, res) => {
    res.json({ status: true, film: FilmModel.update(req.film.id, req.movie, req.director) });
});

// Rota para deletar um filme pelo ID
router.delete("/:id", getFilm, (req, res) => {
    FilmModel.delete(req.params.id);
    res.json({ status: true, oldFilm: req.film });
});

module.exports = router;
