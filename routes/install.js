var express = require('express');
var router = express.Router();

var FilmModel = require("../model/films");
var ActorModel = require("../model/actors");
var OscarModel = require("../model/oscars");
var UserModel = require("../model/user");

//rota para inicialização dos filmes + criação de usuário adm
router.get('/', async (req, res) => {
    try{
        FilmModel.novoFilme("Forrest Gump", "Robert Zemeckis", 4);;
        FilmModel.novoFilme("Stop Making Sense", "Jonathan Demme", 5);
        ActorModel.novoAtor("David Byrne", 1952);
        ActorModel.novoAtor("Tom Hanks", 1956);
        OscarModel.novoOscar("Melhor Ator", 1995)


        await UserModel.createAdmin();

        res.json({ status: true, message: "Instalação concluída!"});
    }

    catch (error) {
        res.status(500).json({ status: false, error: "Erro de instalação: " +error.message})
    }
});

module.exports = router;