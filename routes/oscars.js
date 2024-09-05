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

router.use(verificarToken);

//rota para listar prêmios utilizando paginação
router.get("/", async (req, res) => {
    let { limite = 5, pagina = 1 } = req.query;

    limite = Math.min(Math.max(parseInt(limite), 1), 10);
    pagina = Math.max(parseInt(pagina), 1);

    try {
        const oscars = await OscarModel.listaPaginada(limite, pagina);
        res.json({ status: true, list: oscars });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

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

//rota pra pesquisar e obter prêmio por ID
router.get("/:id", getOscar, (req, res) => {
    res.json({ status: true, oscar: req.oscar });
});

//rota para criar novo prêmio (somente para admins)
router.post("/", verificaAdmin, validaOscar, async (req, res) => {
    try {
        const oscar = await OscarModel.novoOscar(req.nomePremio, req.anoRecebimento);
        res.json({ status: true, oscar });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

//rota para atualizar um prêmio existente
router.put("/:id", verificaAdmin, validaOscar, getOscar, async (req, res) => {
    try {
        const oscar = await OscarModel.attOscar(req.params.id, req.nomePremio, req.anoRecebimento);
        res.json({ status: true, oscar });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

//rota para deletar prêmio por ID
router.delete("/:id", verificaAdmin, getOscar, async (req, res) => {
    try {
        await OscarModel.deletaOscar(req.params.id);
        res.json({ status: true, oldOscar: req.oscar });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

//rota para associar um filme ao oscar
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

//rota para associar um ator ao oscar
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
