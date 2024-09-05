var express = require('express');
var router = express.Router();

var FilmModel = require("../model/films");
var UserModel = require("../model/user");

//rota para inicialização dos filmes + criação de usuário adm
router.get('/', async (req, res) => {
    try{
        FilmModel.new("Forrest Gump", "Robert Zemeckis", 4);
        FilmModel.new("The Wall", "Alan Parker", 5);
        FilmModel.new("Stop Making Sense", "Jonathan Demme", 5);
        FilmModel.new("Click", "Frank Coraci", 3);

        await UserModel.createAdmin();

        res.json({ status: true, message: "Instalação concluída!"});
    }

    catch (error) {
        res.status(500).json({ status: false, error: "Erro de instalação: " +error.message})
    }
});

module.exports = router;