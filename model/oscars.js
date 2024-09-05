const mongoose = require('mongoose');

//esquema para criação de prêmios
const oscarSchema = new mongoose.Schema({
  nomePremio: { type: String, required: true },
  anoRecebimento: { type: Number, required: true },
  films: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Film' }],
  actors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Actor' }]
});

oscarSchema.statics = {

  //criação de novo prêmio
  async novoOscar(nomePremio, anoRecebimento) {
    try {
      const oscar = new this({ nomePremio, anoRecebimento });
      await oscar.save();
      return oscar;
    } catch (error) {
      throw new Error('Erro ao criar Oscar: ' + error.message);
    }
  },

  //atualização dos dados de um prêmio
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

  //associar um filme a um prêmio
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

  //associar um ator a um prêmio
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

  //listar todos os prêmios
  async lista() {
    try {
      const oscars = await this.find().populate('films').populate('actors');
      return oscars;
    } catch (error) {
      throw new Error('Erro ao listar Oscars: ' + error.message);
    }
  },

  //listar prêmio utilizando paginação
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

  //buscar um prêmio por ID
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

  //deletar um prêmio pelo ID
  async deletaOscar(id) {
    try {
      const result = await this.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error('Erro ao deletar Oscar: ' + error.message);
    }
  }
};

const OscarModel = mongoose.model('Oscar', oscarSchema);

module.exports = OscarModel;
