'use strict';

const { ObjectId } = require('mongodb');
const { getMongoClient } = require('./mongodbClient');
const { isValidNonEmptyString } = require('../../utils/validators');
const consts = require('../../../domains/todos/v1/consts');

const repositoryCache = {};

class MongoRepository {
    /**
     * @param {object} db - The MongoDB database instance.
     * @param {string} collectionName - The name of the collection.
     */
    constructor(db, collectionName) {
        if (!db || !collectionName) {
            throw new Error('Database instance and collection name are required.');
        }
        this.db = db;
        this.collectionName = collectionName;
    }

    /**
     * Initializes the repository and ensures the collection exists.
     * @returns {Promise<void>}
     */
    async initialize() {
        const collections = await this.db.listCollections({}, { nameOnly: true }).toArray();
        const collectionNames = collections.map((c) => c.name);

        if (!collectionNames.includes(this.collectionName)) {
            throw new Error(`Collection "${this.collectionName}" does not exist in the database.`);
        }

        this.collection = this.db.collection(this.collectionName);
    }

    /**
     * Inserts a document into the collection.
     * @param {object} document - The document to insert.
     * @returns {Promise<object>} The result of the insert operation.
     */
    async insert(document) {
        return await this.collection.insertOne(document);
    }

    /**
     * Inserts a document with timestamps into the collection.
     * @param {object} document - The document to insert.
     * @returns {Promise<object>} The result of the insert operation.
     */
    async insertWithTimestamps(document) {
        const timestamp = new Date();
        const docWithTimestamps = { ...document, createdAt: timestamp, updatedAt: timestamp };
        return await this.insert(docWithTimestamps);
    }

    /**
     * Updates a document by ID.
     * @param {string} id - The ID of the document to update.
     * @param {object} update - The update object.
     * @returns {Promise<object>} The result of the update operation.
     */
    async update(id, update) {
        if (!ObjectId.isValid(id)) {
            throw new Error('Invalid ID format.');
        }
        return await this.collection.updateOne({ _id: new ObjectId(id) }, { $set: update });
    }

    /**
     * Updates a document by ID with timestamps.
     * @param {string} id - The ID of the document to update.
     * @param {object} update - The update object.
     * @returns {Promise<object>} The result of the update operation.
     */
    async updateWithTimestamps(id, update) {
        const updatedDoc = { ...update, updatedAt: new Date() };
        return await this.update(id, updatedDoc);
    }

    /**
     * Retrieves a document by ID.
     * @param {string} id - The ID of the document to retrieve.
     * @returns {Promise<object|null>} The document, or null if not found.
     */
    async getById(id) {
        if (!ObjectId.isValid(id)) {
            throw new Error('Invalid ID format.');
        }
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    /**
     * Retrieves all documents from the collection.
     * @param {object} [query={}] - The query filter.
     * @param {object} [options={}] - Optional query options (e.g., projection, sort).
     * @returns {Promise<Array<object>>} An array of documents.
     */
    async getAll(query = {}, options = {}) {
        return await this.collection.find(query, options).toArray();
    }

    /**
     * Removes a document by ID.
     * @param {string} id - The ID of the document to remove.
     * @returns {Promise<object>} The result of the delete operation.
     */
    async remove(id) {
        if (!ObjectId.isValid(id)) {
            throw new Error('Invalid ID format.');
        }
        return await this.collection.deleteOne({ _id: new ObjectId(id) });
    }
}

module.exports.MongoRepository = MongoRepository;

module.exports.getMongoDbRepository = async function (dbName, collectionName, options = {}) {
    if (!isValidNonEmptyString(dbName)) {
        throw new Error('Provide a valid database name.');
    }

    if (!isValidNonEmptyString(collectionName)) {
        throw new Error('Provide a valid collection name.');
    }

    if (options.whitelistedCollections && !options.whitelistedCollections.includes(collectionName)) {
        throw new Error(`Invalid collection name: ${collectionName}`);
    }

    const cacheKey = `${dbName}-${collectionName}`;

    if (repositoryCache[cacheKey]) {
        return repositoryCache[cacheKey];
    }

    const client = getMongoClient();
    const db = client.db(dbName);
    const repository = new MongoRepository(db, collectionName);
    await repository.initialize();

    repositoryCache[cacheKey] = repository;

    return repository;
};
