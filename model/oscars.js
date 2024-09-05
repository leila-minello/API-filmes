let ids = 0;
let oscars = [];

module.exports = {

    //criação de um prêmio novo
    new(nomePremio, anoRecebimento) {
        let oscar = { id: ++ids, nomePremio: nomePremio, anoRecebimento: anoRecebimento, films: [], actors: []};
        oscars.push(oscar);
        return oscar;
    },

    //atualização de dados de um prêmio
    update(id, nomePremio, anoRecebimento) {
        let pos = this.getPositionById(id);
        if (pos >= 0) {
            oscars[pos].nomePremio = nomePremio;
            oscars[pos].anoRecebimento = anoRecebimento;
        }

        return oscars[pos];
    },

    filmePraOscar(oscarId, filmId) {
        let oscar = this.getElementById(oscarId);
        if (oscar && !oscar.films.includes(filmId)) {
            oscar.films.push(filmId);
        }
        return oscar;
    },

    atorPraOscar(oscarId, actorId) {
        let oscar = this.getElementById(oscarId);
        if (oscar && !oscar.actors.includes(actorId)) {
            oscar.actors.push(actorId);
        }
        return oscar;
    },

    list() {
        return oscars;
    },

    listPaginated(limite, pagina) {
        const startIndex = (pagina - 1) * limite;
        const endIndex = startIndex + limite;
        return oscars.slice(startIndex, endIndex);
    },

    getElementById(id) {
        let pos = this.getPositionById(id);
        if (pos >= 0) {
            return oscars[pos];
        }

        return null;
    },

    getPositionById(id) {
        for (let i = 0; i < oscars.length; i++) {
            if (oscars[i].id == id) {
                return i;
            }
        }
        return -1;
    },

    delete(id) {
        let i = this.getPositionById(id);
        if (i >= 0) {
            oscars.splice(i, 1);
            return true;
        }

        return false;
    }
};