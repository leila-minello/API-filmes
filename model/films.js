const mongoose = require('mongoose');

//esquema para criação de filme
const filmSchema = new mongoose.Schema({
  movie: { type: String, required: true },
  director: { type: String, required: true },
  nota: { type: Number, required: true },
  actors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Actor' }]
});


filmSchema.statics = {

  //criação de novo filme
  async novoFilme(movie, director, nota) {
    try {
      const film = new this({ movie, director, nota });
      await film.save();
      return film;
    } 
    
    catch (error) {
      throw new Error('Erro ao criar filme: ' + error.message);
    }
  },

  //atualização dos dados de um filme
  async attFilme(id, movie, director, nota) {
    try {
      const film = await this.findByIdAndUpdate(id, { movie, director, nota }, { new: true });
      if (!film) {
        throw new Error('Filme não encontrado');
      }
      return film;
    } 
    
    catch (error) {
      throw new Error('Erro ao atualizar filme: ' + error.message);
    }
  },

  //lista todos os filmes
  async lista() {
    try {
      const films = await this.find();
      return films;
    } 
    
    catch (error) {
      throw new Error('Erro ao listar filmes: ' + error.message);
    }
  },

  //lista os filmes utilizando paginação
  async listaPag(limite, pagina) {
    try {
      const films = await this.find()
        .skip((pagina - 1) * limite)
        .limit(limite);
      return films;
    } 
    
    catch (error) {
      throw new Error('Erro ao listar filmes paginados: ' + error.message);
    }
  },

  //lista os melhores filmes (nota 5)
  async listaMelhores() {
    try {
      const films = await this.find({ nota: 5 });
      return films;
    } 
    
    catch (error) {
      throw new Error('Erro ao listar melhores filmes: ' + error.message);
    }
  },

  //busca um filme pelo seu ID
  async getFilmById(id) {
    try {
      const film = await this.findById(id);
      if (!film) {
        throw new Error('Filme não encontrado');
      }
      return film;
    } 
    
    catch (error) {
      throw new Error('Erro ao buscar filme por ID: ' + error.message);
    }
  },

  //deleta filme pelo ID
  async deletaFilme(id) {
    try {
      const result = await this.findByIdAndDelete(id);
      return !!result;
    } 
    
    catch (error) {
      throw new Error('Erro ao deletar filme: ' + error.message);
    }
  }
};

const FilmModel = mongoose.model('Film', filmSchema);

module.exports = FilmModel;
