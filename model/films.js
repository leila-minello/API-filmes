let ids = 0;
let films = [];

module.exports = {
    new(movie, director) {
        let film = { id: ++ids, movie: movie, director: director };
        films.push(film);
        return film;
    },
    update(id, movie, director) {
        let pos = this.getPositionById(id);
        if (pos >= 0) {
            films[pos].movie = movie;
            films[pos].director = director;
        }
        return films[pos];
    },
    list() {
        return films;
    },
    getElementById(id) {
        let pos = this.getPositionById(id);
        if (pos >= 0) {
            return films[pos];
        }
        return null;
    },
    getPositionById(id) {
        for (let i = 0; i < films.length; i++) {
            if (films[i].id == id) {
                return i;
            }
        }
        return -1;
    },
    delete(id) {
        let i = this.getPositionById(id);
        if (i >= 0) {
            films.splice(i, 1);
            return true;
        }
        return false;
    }
};
