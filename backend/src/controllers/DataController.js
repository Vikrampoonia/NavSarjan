import { MESSAGES } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export class DataController {
    constructor({ dataService }) {
        this.dataService = dataService;
    }

    insert = asyncHandler(async (req, res) => {
        const { collectionName, data } = req.body;
        const result = await this.dataService.insert({ collectionName, data });

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGES.CRUD.INSERT_SUCCESS,
            result,
        });
    });

    fetch = asyncHandler(async (req, res) => {
        const { collectionName, condition, projection } = req.body;

        const data = await this.dataService.fetch({
            collectionName,
            condition: condition || {},
            projection: projection || {},
        });

        return res.status(HTTP_STATUS.OK).json({ success: true, data });
    });

    fetchOne = asyncHandler(async (req, res) => {
        const { collectionName, condition, projection } = req.body;

        const data = await this.dataService.fetchOne({
            collectionName,
            condition: condition || {},
            projection: projection || {},
        });

        return res.status(HTTP_STATUS.OK).json({ success: true, data });
    });

    replace = asyncHandler(async (req, res) => {
        const { collectionName, condition, data } = req.body;

        const result = await this.dataService.replace({
            collectionName,
            condition,
            data,
        });

        if (!result.ok) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.CRUD.NOT_FOUND);
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MESSAGES.CRUD.REPLACE_SUCCESS,
            result: result.result,
        });
    });
}
