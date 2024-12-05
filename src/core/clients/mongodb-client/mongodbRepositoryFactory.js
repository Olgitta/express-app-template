const {ObjectId} = require('mongodb');
const {getMongoClient} = require('./mongodbClient');
const {isValidNonEmptyString} = require('../../utils/validators');

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
        const collections = await this.db.listCollections({}, {nameOnly: true}).toArray();
        const collectionNames = collections.map(c => c.name);

        if (!collectionNames.includes(this.collectionName)) {
            throw new Error(`Collection "${this.collectionName}" does not exist in the database.`);
        }

        this.collection = this.db.collection(this.collectionName);
    }

    /**
     *
     * @param document
     * @returns {Promise<*>}
     */
    async insert(document) {
        return await this.collection.insertOne(document);
    }

    /**
     *
     * @param document
     * @returns {Promise<*>}
     */
    async insertWithTimestamps(document) {
        const timestamp = new Date();
        document.createdAt = timestamp;
        document.updatedAt = timestamp;
        return await this.collection.insertOne(document);
    }

    /**
     *
     * @param id
     * @param update
     * @returns {Promise<*>}
     */
    async update(id, update) {
        return await this.collection.updateOne(
            {_id: new ObjectId(id)},
            {$set: update}
        );
    }

    /**
     *
     * @param id
     * @param update
     * @returns {Promise<*>}
     */
    async updateWithTimestamps(id, update) {
        update.updatedAt = new Date();

        return await this.collection.updateOne(
            {_id: new ObjectId(id)},
            {$set: update}
        );
    }

    /**
     * Gets a document from the collection by ID.
     * @param {string} id - The ID of the document to retrieve.
     * @returns {Promise<object|null>} The document, or null if not found.
     */
    async getById(id) {
        return await this.collection.findOne({_id: new ObjectId(id)});
    }

    /**
     * Gets all documents from the collection.
     * @returns {Promise<Array<object>>} An array of all documents.
     */
    async getAll() {
        return await this.collection.find({}).toArray();
    }

    /**
     * Removes a document from the collection by ID.
     * @param {string} id - The ID of the document to remove.
     * @returns {Promise<object>} The result of the delete operation.
     */
    async remove(id) {
        return await this.collection.deleteOne({_id: new ObjectId(id)});
    }
}

module.exports.MongoRepository = MongoRepository;

module.exports.getMongoDbRepository = async function (dbName, collectionName) {

    if (!isValidNonEmptyString(dbName)) {
        throw new Error('Provide valid dbName');
    }

    if (!isValidNonEmptyString(collectionName)) {
        throw new Error('Provide valid collectionName');
    }

    const cacheKey = `${dbName}-${collectionName}`;

    if (repositoryCache[cacheKey]) {
        return repositoryCache[cacheKey];
    }

    const client = getMongoClient();
    const db = client.db(dbName);
    const repo = new MongoRepository(db, collectionName);
    await repo.initialize();

    repositoryCache[cacheKey] = repo;

    return repo;
};
