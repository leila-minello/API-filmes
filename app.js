const mongoose = require('mongoose');
var express = require('express');
var path = require('path');
require('dotenv').config();

var indexRouter = require('./routes/index');
var filmRouter = require("./routes/films");
const { router: authRouter } = require('./routes/auth');
var installRouter = require('./routes/install');

const app = express();

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log('Servidor OK!');
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', indexRouter);
app.use("/api/films", filmRouter);
app.use("/api/auth", authRouter);
app.use('/install', installRouter);


mongoose.connect('mongodb://localhost:27017/mydatabase', {
  serverSelectionTimeoutMS: 30000
})
  .then(() => console.log('Conectado ao MongoDB com sucesso'))
  .catch(err => console.error('Erro ao conectar ao MongoDB', err));


module.exports = app;
