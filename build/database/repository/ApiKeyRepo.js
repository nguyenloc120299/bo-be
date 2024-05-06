"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Apikey_1 = require("../model/Apikey");
async function findByKey(key) {
    return Apikey_1.ApiKeyModel.findOne({ key: key, status: true }).lean().exec();
}
exports.default = {
    findByKey,
};
//# sourceMappingURL=ApiKeyRepo.js.map