import { CollectionModel } from "../models/CollectionModel.js";

export class DataService {
    constructor({ db, historyService, toObjectId }) {
        this.db = db;
        this.historyService = historyService;
        this.toObjectId = toObjectId;
    }

    getCollectionModel(collectionName) {
        return new CollectionModel(this.db, collectionName);
    }

    normalizeCondition(condition = {}) {
        const nextCondition = { ...condition };
        if (nextCondition._id) {
            nextCondition._id = this.toObjectId(nextCondition._id);
        }
        return nextCondition;
    }

    normalizeData(data = {}) {
        const nextData = { ...data };
        if (nextData._id) {
            nextData._id = this.toObjectId(nextData._id);
        }
        return nextData;
    }

    async insert({ collectionName, data }) {
        const collection = this.getCollectionModel(collectionName);
        const result = await collection.insertOne(data);

        await this.historyService.logHistory({
            entityType: collectionName,
            entityId: result.insertedId,
            fieldChanged:
                collectionName === "startup"
                    ? "New Startup Launched"
                    : collectionName === "ipr"
                        ? "IPR Request"
                        : "New Project Open",
            changedBy: data?.ownerid || data?.founderuserid || "admin",
        });

        return result;
    }

    async fetch({ collectionName, condition = {}, projection = {} }) {
        const collection = this.getCollectionModel(collectionName);
        return collection.find(condition, projection);
    }

    async fetchOne({ collectionName, condition = {}, projection = {} }) {
        const collection = this.getCollectionModel(collectionName);
        const safeCondition = this.normalizeCondition(condition);
        return collection.findOne(safeCondition, projection);
    }

    async replace({ collectionName, condition, data }) {
        const collection = this.getCollectionModel(collectionName);
        const safeCondition = this.normalizeCondition(condition);
        const safeData = this.normalizeData(data);

        const result = await collection.replaceOne(safeCondition, safeData);

        if (result.matchedCount === 0) {
            return { ok: false, result };
        }

        await this.historyService.logHistory({
            entityType: collectionName,
            entityId: safeData._id,
            fieldChanged:
                collectionName === "startup"
                    ? "Startup Edit"
                    : collectionName === "ipr"
                        ? "IPR Request Changed"
                        : "Project Approval",
            changedBy: safeData?.ownerid || safeData?.founderuserid || "admin",
            isVerification: collectionName === "history",
        });

        if (collectionName === "history" && safeData.isVerification === true) {
            const sourceCollection = this.getCollectionModel(safeData.entityType);
            if (safeData.entityType === "user") {
                await sourceCollection.updateOne(
                    { email: safeData.entityId },
                    { $set: { isVerification: safeData.isVerification } }
                );
            } else {
                await sourceCollection.updateOne(
                    { _id: this.toObjectId(safeData.entityId) },
                    { $set: { level: safeData.isVerification } }
                );
            }
        }

        return { ok: true, result };
    }
}
