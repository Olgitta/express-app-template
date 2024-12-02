const {ObjectId} = require('mongodb');
const {getMongoClient} = require('./mongodbClient');
const {isStringEmpty} = require('../../utils/validators');

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
     * Updates a document in the collection by ID.
     * @param {string} id - The ID of the document to update.
     * @param {object} update - The update object.
     * @returns {Promise<object>} The result of the update operation.
     */
    async update(id, update) {
        const result = await this.collection.updateOne(
            {_id: new ObjectId(id)},
            {$set: update}
        );
        if (result.matchedCount === 0) {
            throw new Error(`Document with ID ${id} not found.`);
        }
        return result;
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
        const result = await this.collection.deleteOne({_id: new ObjectId(id)});
        if (result.deletedCount === 0) {
            throw new Error(`Document with ID ${id} not found.`);
        }
        return result;
    }
}

module.exports.MongoRepository = MongoRepository;

module.exports.getMongoDbRepository = async function (dbName, collectionName) {

    if (isStringEmpty(dbName)) {
        throw new TypeError('Provide valid dbName');
    }

    if (isStringEmpty(collectionName)) {
        throw new TypeError('Provide valid collectionName');
    }

    const client = getMongoClient();

    const db = client.db(dbName);
    const repo = new MongoRepository(db, collectionName);
    await repo.initialize();

    return repo;
};
