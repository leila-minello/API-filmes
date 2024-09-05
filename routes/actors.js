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

router.use(verificarToken);

//rota para listar atores com paginação
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

//rota para pesquisar e obter ator por ID
router.get("/:id", getActor, (req, res) => {
    res.json({ status: true, actor: req.actor });
});

//rota para criar novo ator (somente para admins)
router.post("/", verificaAdmin, validaAtor, async (req, res) => {
    try {
        const novoAtor = await ActorModel.novoAtor(req.name, req.birthYear);
        res.json({ status: true, actor: novoAtor });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

//rota para atualizar dados de um ator existente
router.put("/:id", verificaAdmin, validaAtor, async (req, res) => {
    try {
        const atorAtualizado = await ActorModel.attAtor(req.params.id, req.name, req.birthYear);
        res.json({ status: true, actor: atorAtualizado });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

//rota para deletar um ator pelo seu ID
router.delete("/:id", verificaAdmin, getActor, async (req, res) => {
    try {
        await ActorModel.deletaAtor(req.params.id);
        res.json({ status: true, oldActor: req.actor });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

//rota para associar um filme a um ator
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
