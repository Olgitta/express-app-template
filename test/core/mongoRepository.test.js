'use strict';

const { MongoClient, ObjectId } = require('mongodb');
const {MongoRepository, getMongoDbRepository} = require('../../src/core/clients/mongodb-client/mongodbRepositoryFactory');

jest.mock('mongodb', () => {
    const mCollection = {
        insertOne: jest.fn(),
        updateOne: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(() => ({ toArray: jest.fn() })),
        deleteOne: jest.fn(),
    };

    const mDb = {
        listCollections: jest.fn(() => ({
            toArray: jest.fn(() => [{ name: 'todos' }]),
        })),
        collection: jest.fn(() => mCollection),
    };

    const mClient = {
        db: jest.fn(() => mDb),
        connect: jest.fn(),
        close: jest.fn(),
    };

    return {
        MongoClient: jest.fn(() => mClient),
        ObjectId: jest.requireActual('mongodb').ObjectId,
    };
});

describe('MongoRepository', () => {
    let repository;
    let dbMock;
    let collectionMock;

    beforeEach(async () => {
        const client = new MongoClient();
        const db = client.db('testdb');
        dbMock = db;
        collectionMock = db.collection();
        repository = new MongoRepository(db, 'todos');
        // repository = getMongoDbRepository('testdb', 'todos');
        await repository.initialize();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should throw an error if the collection does not exist', async () => {
        dbMock.listCollections.mockReturnValueOnce({
            toArray: jest.fn().mockResolvedValue([]),
        });

        await expect(repository.initialize()).rejects.toThrow(
            'Collection "todos" does not exist in the database.'
        );
    });

    test('should initialize successfully if the collection exists', async () => {
        await repository.initialize();
        expect(dbMock.collection).toHaveBeenCalledWith('todos');
        expect(repository.collection).toBe(collectionMock);
    });

    test('should insert a document into the collection', async () => {
        const document = { title: 'Test Todo', completed: false };
        collectionMock.insertOne.mockResolvedValue({ acknowledged: true, insertedId: '674ebcbd7494e89c198ff00f' });

        const result = await repository.insert(document);

        expect(collectionMock.insertOne).toHaveBeenCalledWith(document);
        expect(result).toEqual({ acknowledged: true, insertedId: '674ebcbd7494e89c198ff00f' });
    });

    test('should insert a document with timestamps', async () => {
        const document = { title: 'Test Todo', completed: false };
        const now = new Date();
        jest.spyOn(global, 'Date').mockImplementation(() => now);

        collectionMock.insertOne.mockResolvedValue({ acknowledged: true, insertedId: '674ebcbd7494e89c198ff00f' });

        const result = await repository.insertWithTimestamps(document);

        expect(collectionMock.insertOne).toHaveBeenCalledWith({
            ...document,
            createdAt: now,
            updatedAt: now,
        });
        expect(result).toEqual({ acknowledged: true, insertedId: '674ebcbd7494e89c198ff00f' });

        jest.restoreAllMocks();
    });

    test('should update a document in the collection', async () => {
        const id = '674ebcbd7494e89c198ff00f';
        const update = { title: 'Updated Todo' };

        collectionMock.updateOne.mockResolvedValue({ acknowledged: true, matchedCount: 1 });

        const result = await repository.update(id, update);

        expect(collectionMock.updateOne).toHaveBeenCalledWith(
            { _id: new ObjectId(id) },
            { $set: update }
        );
        expect(result).toEqual({ acknowledged: true, matchedCount: 1 });
    });

    test('should update a document with timestamps', async () => {
        const id = '674ebcbd7494e89c198ff00f';
        const update = { title: 'Updated Todo' };
        const now = new Date();
        jest.spyOn(global, 'Date').mockImplementation(() => now);

        collectionMock.updateOne.mockResolvedValue({ acknowledged: true, matchedCount: 1 });

        const result = await repository.updateWithTimestamps(id, update);

        expect(collectionMock.updateOne).toHaveBeenCalledWith(
            { _id: new ObjectId(id) },
            { $set: { ...update, updatedAt: now } }
        );
        expect(result).toEqual({ acknowledged: true, matchedCount: 1 });

        jest.restoreAllMocks();
    });

    test('should get a document by ID', async () => {
        const id = '674ebcbd7494e89c198ff00f';
        const document = { _id: id, title: 'Test Todo' };

        collectionMock.findOne.mockResolvedValue(document);

        const result = await repository.getById(id);

        expect(collectionMock.findOne).toHaveBeenCalledWith({ _id: new ObjectId(id) });
        expect(result).toEqual(document);
    });

    test('should get all documents from the collection', async () => {
        const documents = [
            { _id: 'id1', title: 'Test Todo 1' },
            { _id: 'id2', title: 'Test Todo 2' },
        ];

        // collectionMock.find().toArray.mockResolvedValue(documents);

        collectionMock.find.mockReturnValue({
            toArray: jest.fn().mockResolvedValue(documents),
        });

        const result = await repository.getAll();

        expect(collectionMock.find).toHaveBeenCalledWith({});
        expect(result).toEqual(documents);
    });

    test('should remove a document by ID', async () => {
        const id = '674ebcbd7494e89c198ff00f';

        collectionMock.deleteOne.mockResolvedValue({ acknowledged: true, deletedCount: 1 });

        const result = await repository.remove(id);

        expect(collectionMock.deleteOne).toHaveBeenCalledWith({ _id: new ObjectId(id) });
        expect(result).toEqual({ acknowledged: true, deletedCount: 1 });
    });
});
