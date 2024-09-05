const mongoose = require('mongoose');

//esquema para criação de atores
const actorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  birthYear: { type: Number, required: true },
  films: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Film' }]
});

actorSchema.statics = {

  //criação de novo ator
  async novoAtor(name, birthYear) {
    try {
      const actor = new this({ name, birthYear });
      await actor.save();
      return actor;

    } catch (error) {
        throw new Error('Erro ao criar registro do ator!: ' + error.message);
    }
  },

  //atualização dos dados de um ator
  async attAtor(id, name, birthYear) {
    try {
      const actor = await this.findByIdAndUpdate(id, { name, birthYear }, { new: true });
      if (!actor) {
        throw new Error('Ator não encontrado.');
      }
      return actor;
      } 
    
      catch (error) {
        throw new Error('Erro ao atualizar dados do ator!: ' + error.message);
    }
  },

  //associa um ator a um filme
  async filmePraAtor(actorId, filmId) {
    try {
      const actor = await this.findById(actorId);
      if (actor && !actor.films.includes(filmId)) {
        actor.films.push(filmId);
        await actor.save();
      }
      return actor;
      } 
      
      catch (error) {
        throw new Error('Erro ao associar filme ao ator!: ' + error.message);
    }
  },

  //lista todos os atores
  async lista() {
    try {
      const actors = await this.find();
      return actors;
    } 
    
    catch (error) {
      throw new Error('Erro ao listar os atores!: ' + error.message);
    }
  },

  //lista os atores utilizando paginação
  async listaPag(limite, pagina) {
    try {
      const actors = await this.find()
        .skip((pagina - 1) * limite)
        .limit(limite);
      return actors;
    } 
    
    catch (error) {
      throw new Error('Erro ao listar os atores por paginação!: ' + error.message);
    }
  },

  //busca um ator pelo seu ID
  async getActorById(id) {
    try {
      const actor = await this.findById(id);
      if (!actor) {
        throw new Error('Ator não encontrado.');
      }
      return actor;
    } 
    
    catch (error) {
      throw new Error('Erro ao buscar ator pelo ID!: ' + error.message);
    }
  },

  //deleta um ator pelo seu ID
  async deletaAtor(id) {
    try {
      const result = await this.findByIdAndDelete(id);
      return !!result; 
    } 
    
    catch (error) {
      throw new Error('Erro ao deletar ator!: ' + error.message);
    }
  }
};

const ActorModel = mongoose.model('Actor', actorSchema);

module.exports = ActorModel;
