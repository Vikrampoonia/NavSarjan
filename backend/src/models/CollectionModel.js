export class CollectionModel {
    constructor(db, collectionName) {
        this.db = db;
        this.collectionName = collectionName;
    }

    collection() {
        return this.db.collection(this.collectionName);
    }

    async insertOne(data) {
        return this.collection().insertOne(data);
    }

    async find(condition = {}, projection = {}) {
        return this.collection().find(condition).project(projection).toArray();
    }

    async findOne(condition = {}, projection = {}) {
        return this.collection().findOne(condition, projection);
    }

    async replaceOne(condition, data) {
        return this.collection().replaceOne(condition, data);
    }

    async updateOne(condition, update, options = {}) {
        return this.collection().updateOne(condition, update, options);
    }

    async updateMany(condition, update, options = {}) {
        return this.collection().updateMany(condition, update, options);
    }

    async aggregate(pipeline = []) {
        return this.collection().aggregate(pipeline).toArray();
    }

    async deleteOne(condition = {}) {
        return this.collection().deleteOne(condition);
    }
}
