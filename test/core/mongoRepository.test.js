const { MongoClient } = require('mongodb');
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
            toArray: jest.fn(() => [{ name: 'testcollection' }]),
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
    let repo;
    let dbMock;
    let collectionMock;

    beforeEach(async () => {
        const client = new MongoClient();
        const db = client.db('testdb');
        dbMock = db;
        collectionMock = db.collection();
        repo = new MongoRepository(db, 'testcollection');
        await repo.initialize();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize and validate the collection exists', async () => {
        expect(dbMock.listCollections).toHaveBeenCalledWith({}, { nameOnly: true });
        expect(dbMock.collection).toHaveBeenCalledWith('testcollection');
    });

    it('should throw an error if the collection does not exist', async () => {
        dbMock.listCollections.mockReturnValueOnce({
            toArray: jest.fn(() => []), // Simulate no collections found
        });

        await expect(repo.initialize()).rejects.toThrow('Collection "testcollection" does not exist in the database.');
    });

    it('should insert a document and return the result', async () => {
        const mockDocument = { name: 'John Doe', age: 30 };
        const mockInsertResult = {
            "acknowledged": true,
            "insertedId": "674dc2251dfd95ec1d8d3eb6"
        };
        collectionMock.insertOne.mockResolvedValue(mockInsertResult);

        const result = await repo.insert(mockDocument);

        expect(collectionMock.insertOne).toHaveBeenCalledWith(mockDocument);
        expect(result).toEqual(mockInsertResult);
    });

    it('should update a document by ID', async () => {
        const mockId = '5f50c31f1c9d440000f99af3';
        const mockUpdate = { age: 31 };
        const mockUpdateResult = { matchedCount: 1 };

        collectionMock.updateOne.mockResolvedValue(mockUpdateResult);

        const result = await repo.update(mockId, mockUpdate);

        expect(collectionMock.updateOne).toHaveBeenCalledWith(
            { _id: expect.any(Object) },
            { $set: mockUpdate }
        );
        expect(result).toEqual(mockUpdateResult);
    });

    it('should throw an error if the document to update is not found', async () => {
        const mockId = '5f50c31f1c9d440000f99af3';
        const mockUpdate = { age: 31 };

        collectionMock.updateOne.mockResolvedValue({ matchedCount: 0 });

        await expect(repo.update(mockId, mockUpdate)).rejects.toThrow(`Document with ID ${mockId} not found.`);
    });

    it('should retrieve a document by ID', async () => {
        const mockId = '5f50c31f1c9d440000f99af3';
        const mockDocument = { _id: mockId, name: 'John Doe', age: 30 };

        collectionMock.findOne.mockResolvedValue(mockDocument);

        const result = await repo.getById(mockId);

        expect(collectionMock.findOne).toHaveBeenCalledWith({ _id: expect.any(Object) });
        expect(result).toEqual(mockDocument);
    });

    it('should retrieve all documents from the collection', async () => {
        const mockDocuments = [
            { _id: '1', name: 'Alice' },
            { _id: '2', name: 'Bob' },
        ];
        // collectionMock.find().toArray.mockResolvedValue(mockDocuments);
        collectionMock.find.mockReturnValue({
            toArray: jest.fn().mockResolvedValue(mockDocuments),
        });

        const result = await repo.getAll();

        expect(collectionMock.find).toHaveBeenCalledWith({});
        expect(result).toEqual(mockDocuments);
    });

    it('should remove a document by ID', async () => {
        const mockId = '5f50c31f1c9d440000f99af3';
        const mockDeleteResult = { deletedCount: 1 };

        collectionMock.deleteOne.mockResolvedValue(mockDeleteResult);

        const result = await repo.remove(mockId);

        expect(collectionMock.deleteOne).toHaveBeenCalledWith({ _id: expect.any(Object) });
        expect(result).toEqual(mockDeleteResult);
    });

    it('should throw an error if the document to remove is not found', async () => {
        const mockId = '5f50c31f1c9d440000f99af3';

        collectionMock.deleteOne.mockResolvedValue({ deletedCount: 0 });

        await expect(repo.remove(mockId)).rejects.toThrow(`Document with ID ${mockId} not found.`);
    });
});
