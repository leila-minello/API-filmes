let ids = 0;
let actors = [];

module.exports = {

    //criação de novo log de ator
    new(name, birthYear) {
        let actor = { id: ids++, name: name, birthYear: birthYear, films: [] };
        actors.push(actor);
        return actor; 
    },

    //atualização dos dados do ator
    update(id, name, birthYear) {
        let pos = this.getPositionById(id);
        if (pos >= 0 ) {
            actors[pos].name = name;
            actors[pos].birthYear = birthYear;
        }

        return actors[pos];
    },
    
    //função para associar atores a filmes
    filmeParaAtor(actorId, filmId) {
        let actor = this.getElementById(actorId);
        if (actor && !actor.films.includes(filmId)) {
            actor.films.push(filmId);
        }

        return actor;
    },

    //lista os atores
    list() {
        return actors;
    },

    listPaginated(limite, pagina) {
        const startIndex = (pagina - 1) * limite;
        const endIndex = startIndex + limite;
        return actors.slice(startIndex, endIndex);
    },

    //acha ator por ID
    getElementById(id) {
        let pos = this.getPositionById(id);
        if (pos >= 0) {
            return actors[pos];
        }
        return null;
    },

    //acha posição do ator pelo ID
    getPositionById(id) {
        for (let i = 0; i < actors.length; i++) {
            if (actors[i].id == id) {
                return i;
            }
        }
        return -1;
    },

    delete(id) {
        let i = this.getPositionById(id);
        if (i >= 0) {
            actors.splice(i, 1);
            return true;
        }
        return false;
    }
};