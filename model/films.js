let ids = 0;
let films = [];

module.exports = {

    //criação de novo log de filme
    new(movie, director, nota = 1) {
        let film = { id: ++ids, movie: movie, director: director, nota: nota };
        films.push(film);
        return film;
    },

    //atualização de dados de filme
    update(id, movie, director, nota) {
        let pos = this.getPositionById(id);
        if (pos >= 0) {
            films[pos].movie = movie;
            films[pos].director = director;
            films[pos].nota = nota;
        }
        return films[pos];
    },

    //lista os filmes
    list() {
        return films;
    },

    //lista os melhores filmes (filmes com nota 5 atribuída)
    listMelhores() {
        return films.filter(film => film.nota === 5);
    },

    //acha um filme pelo id
    getElementById(id) {
        let pos = this.getPositionById(id);
        if (pos >= 0) {
            return films[pos];
        }
        return null;
    },

    //identifica posição do filme pelo id
    getPositionById(id) {
        for (let i = 0; i < films.length; i++) {
            if (films[i].id == id) {
                return i;
            }
        }
        return -1;
    },

    //deleta registros do filme
    delete(id) {
        let i = this.getPositionById(id);
        if (i >= 0) {
            films.splice(i, 1);
            return true;
        }
        return false;
    }
};
