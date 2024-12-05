'use strict';

class TodoBuilder {
    constructor() {
        this.id = undefined;
        this.title = undefined;
        this.completed = undefined;
    }

    /**
     * Sets the ID for the Todo.
     * @param {string} id
     * @returns {TodoBuilder}
     */
    setId(id) {
        this.id = id;
        return this; // Enable chaining
    }

    /**
     * Sets the title for the Todo.
     * @param {string} title
     * @returns {TodoBuilder}
     */
    setTitle(title) {
        this.title = title;
        return this; // Enable chaining
    }

    /**
     * Sets the completion status for the Todo.
     * @param {boolean} completed
     * @returns {TodoBuilder}
     */
    setCompleted(completed) {
        this.completed = completed;
        return this; // Enable chaining
    }

    buildForCreation() {
        return {
            title: this.title,
            completed: this.completed,
        };
    }

    /**
     * Builds the Todo object.
     * @returns {object}
     */
    build() {
        return {
            id: this.id,
            title: this.title,
            completed: this.completed,
        };
    }
}

module.exports = TodoBuilder;
