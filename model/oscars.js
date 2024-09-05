const mongoose = require('mongoose');

// Esquema para o modelo Oscar
const oscarSchema = new mongoose.Schema({
  nomePremio: { type: String, required: true },
  anoRecebimento: { type: Number, required: true },
  films: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Film' }],
  actors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Actor' }]
});

oscarSchema.statics = {

  // Criação de um novo Oscar
  async novoOscar(nomePremio, anoRecebimento) {
    try {
      const oscar = new this({ nomePremio, anoRecebimento });
      await oscar.save();
      return oscar;
    } catch (error) {
      throw new Error('Erro ao criar Oscar: ' + error.message);
    }
  },

  // Atualização dos dados de um Oscar
  async attOscar(id, nomePremio, anoRecebimento) {
    try {
      const oscar = await this.findByIdAndUpdate(id, { nomePremio, anoRecebimento }, { new: true });
      if (!oscar) {
        throw new Error('Oscar não encontrado');
      }
      return oscar;
    } catch (error) {
      throw new Error('Erro ao atualizar Oscar: ' + error.message);
    }
  },

  // Associar um filme a um Oscar
  async filmeParaOscar(oscarId, filmId) {
    try {
      const oscar = await this.findById(oscarId);
      if (oscar && !oscar.films.includes(filmId)) {
        oscar.films.push(filmId);
        await oscar.save();
      }
      return oscar;
    } catch (error) {
      throw new Error('Erro ao associar filme ao Oscar: ' + error.message);
    }
  },

  // Associar um ator a um Oscar
  async atorParaOscar(oscarId, actorId) {
    try {
      const oscar = await this.findById(oscarId);
      if (oscar && !oscar.actors.includes(actorId)) {
        oscar.actors.push(actorId);
        await oscar.save();
      }
      return oscar;
    } catch (error) {
      throw new Error('Erro ao associar ator ao Oscar: ' + error.message);
    }
  },

  // Listar todos os Oscars
  async lista() {
    try {
      const oscars = await this.find().populate('films').populate('actors');
      return oscars;
    } catch (error) {
      throw new Error('Erro ao listar Oscars: ' + error.message);
    }
  },

  // Listar Oscars com paginação
  async listaPaginada(limite, pagina) {
    try {
      const oscars = await this.find()
        .skip((pagina - 1) * limite)
        .limit(limite)
        .populate('films')
        .populate('actors');
      return oscars;
    } catch (error) {
      throw new Error('Erro ao listar Oscars paginados: ' + error.message);
    }
  },

  // Buscar um Oscar por ID
  async getOscarById(id) {
    try {
      const oscar = await this.findById(id).populate('films').populate('actors');
      if (!oscar) {
        throw new Error('Oscar não encontrado');
      }
      return oscar;
    } catch (error) {
      throw new Error('Erro ao buscar Oscar por ID: ' + error.message);
    }
  },

  // Deletar um Oscar pelo ID
  async deletaOscar(id) {
    try {
      const result = await this.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error('Erro ao deletar Oscar: ' + error.message);
    }
  },

  // Inicializar a coleção de Oscars com alguns registros
  async inicializaOscars() {
    try {
      await this.deleteMany({});
      await this.novoOscar("Melhor Filme", 2023);
      await this.novoOscar("Melhor Ator", 2023);
      await this.novoOscar("Melhor Diretor", 2023);
    } catch (error) {
      throw new Error('Erro ao inicializar Oscars: ' + error.message);
    }
  }
};

const OscarModel = mongoose.model('Oscar', oscarSchema);

module.exports = OscarModel;
