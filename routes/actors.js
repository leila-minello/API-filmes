var express = require('express');
var router = express.Router();

var ActorModel = require("../model/actors");
var FilmModel = require("../model/films");
var { verificarToken, verificaAdmin } = require("./auth");

//middleware para validar os dados do ator
let validaAtor = (req, res, next) => {
    let { name, birthYear } = req.body;
    const currentYear = new Date().getFullYear();

    if(!name || !birthYear) {
        return res.status(400).json({ status: false, error: "O nome e ano de nascimento são obrigatórios!"});
    }

    if (isNaN(birthYear) || birthYear > currentYear) {
        return res.status(400).json({ status: false, error: `O ano de recebimento deve ser válido (até ${currentYear}).` });
    }

    req.name = name;
    req.birthYear = birthYear;
    next();
}

router.use(verificarToken);

//rota para listar atores com paginação
router.get("/", (req, res) => {
    let { limite = 5, pagina = 1 } = req.query;

    limite = Math.min(Math.max(parseInt(limite), 1), 10); 
    pagina = Math.max(parseInt(pagina), 1); 

    const atores = ActorModel.listPaginated(limite, pagina);
    res.json({ status: true, list: atores });
});

//middleware para procurar ator por id
let getActor = (req, res, next) => {
    let id = req.params.id;
    let actor = ActorModel.getElementById(id);
    if (actor == null) {
        return res.status(404).json({ status: false, error: "Ator não encontrado!" });
    }
    req.actor = actor;
    next();
};

//rota para pesquisar e obter ator por ID
router.get("/:id", verificarToken, getActor, (req, res) => {
    res.json({ status: true, actor: req.actor });
});

//rota para criar novo ator (somente para admins)
router.post("/", verificaAdmin, validaAtor, (req, res) => {
    res.json({ status: true, actor: ActorModel.new(req.name, req.birthYear)});
});

//rota para atualizar dados de um ator existente
router.put("/:id", verificaAdmin, validaAtor, (req, res) => {
    res.json({ status: true, actor: ActorModel.update(req.params.id, req.name, req.birthYear) });
});

//rota para deletar um ator pelo seu ID
router.delete("/:id", verificaAdmin, getActor, (req, res) => {
    ActorModel.delete(req.params.id);
    res.json({ status: true, oldActor: req.actor });
});

//rota para associar um filme a um ator
router.post("/:actorId/films/:filmId", verificaAdmin, (req, res) => {

    let actor = ActorModel.filmeParaAtor(req.params.actorId, req.params.filmId);

    if (!actor) {
        return res.status(404).json({ status: false, error: "Ator não encontrado!"});
    }

    let film = FilmModel.getElementById(req.params.filmId);

    if (!film) {
        return res.status(404).json({ status: false, error: "Filme não encontrado!"});
    }

    film.actors = film.actors || [];
    if (!film.actors.includes(req.params.actorId)) {
        film.actors.push(req.params.actorId);
    }

    res.json({ status: true, actor});
});


module.exports = router;