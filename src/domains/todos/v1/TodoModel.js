'use strict';

class Todo {

    get title() {
        return this._title;
    }

    set title(value) {
        this._title = value;
    }

    get completed() {
        return this._completed;
    }

    set completed(value) {
        this._completed = value;
    }

    map (){
        return {
            title: this.title,
            completed: this.completed,
        }
    }
}

module.exports = Todo;
