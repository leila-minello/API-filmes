var express = require('express');
var router = express.Router();

var OscarModel = require("../model/oscars");
var FilmModel = require("../model/films");
var ActorModel = require("../model/actors");
var { verificarToken, verificaAdmin } = require("./auth");

//middleware para validar dados do oscar
let validaOscar = (req, res, next) => {
    let { nomePremio, anoRecebimento } = req.body;
    const currentYear = new Date().getFullYear();

    if (!nomePremio || !anoRecebimento) {
        return res.status(400).json({ status: false, error: "O nome do prêmio e o ano de recebimento são obrigatórios!"});
    }

    if(isNaN(anoRecebimento) || anoRecebimento > currentYear) {
        return res.status(400).json({ status: false, error: "O ano de recebimento deve ser válido (até ${currentYear})."});
    }

    req.nomePremio = nomePremio;
    req.anoRecebimento = anoRecebimento
    next();
}

router.use(verificarToken);

//rota para listar os prêmios usando paginação
router.get("/", (req, res) => {
    let { limite = 5, pagina = 1 } = req.query;

    limite = Math.min(Math.max(parseInt(limite), 1), 10);
    pagina = Math.max(parseInt(pagina), 1);

    const oscars = OscarModel.listPaginated(limite, pagina);
    res.json({ status: true, list: oscars });
});

//middleware para procurar prêmio por id
let getOscar = (req, res, next) => {
    let id = req.params.id;
    let oscar = OscarModel.getElementById(id);
    if (oscar == null) {
        return res.status(400).json({ status: false, error: "Oscar não encontrado!"});
    }

    req.oscar = oscar;
    next();
}

//rota para pesquisar e obter prêmio por ID
router.get("/:id", getOscar, (req, res)  => {
    res.json({ status: true, oscar: req.oscar});
});

//rota para criar novo prêmio (somente para admins)
router.post("/", verificaAdmin, validaOscar, (req, res) => {
    res.json({ status: true, oscar: OscarModel.new(req.nomePremio, req.anoRecebimento)});
});

//rota para atualizar um prêmio existente
router.put("/:id", verificaAdmin, getOscar, (req, res) => {
    res.json({ status: true, oscar: OscarModel.update(req.params.id, req.nomePremio, req.anoRecebimento)});
});

//rota para deletar prêmio por ID
router.delete("/:id", verificaAdmin, getOscar, (req, res) => {
    OscarModel.delete(req.params.id);
    res.json({ status: true, oldOscar: req.oscar });
});

//rota para associar um filme ao oscar
router.post("/:oscarId/films/:filmId", verificaAdmin, (req, res) => {

    let oscar = OscarModel.filmePraOscar(req.params.oscarId, req.params.filmId);
    if(!oscar) {
        return res.status(404).json({ status: false, error: "Oscar não encontrado!"});
    }

    let film = FilmModel.getElementById(req.params.filmId);
    if(!film) {
        return res.status(404).json({ status: false, error: "Filme não encontrado!"});
    }

    film.oscars = film.oscars || [];

    if (!film.oscars.includes(req.params.oscarId)) {
        film.oscars.push(req.params.oscarId);
    }

    res.json({ status: true, oscar });
});

//rota para associar um ator ao oscar
router.post("/:oscarId/actors/:actorId", verificaAdmin, (req, res) => {

    let oscar = OscarModel.atorPraOscar(req.params.oscarId, req.params,actorId);
    if (!oscar) {
        return res.status(404).json({ status: false, error: "Oscar não encontrado!"});
    } 

    let actor = ActorModel.getElementById(req.params.actorId);
    if (!actor) {
        return res.status(404).json({ status: false, error: "Ator não encontrado!"});
    }

    actors.oscars = actors.oscars || [];

    if (!actor.oscars.includes(req.params.oscarId)) {
        actor.oscars.push(req.params.oscarId);
    }

    res.json({ status: true, oscar});
});

module.exports = router;