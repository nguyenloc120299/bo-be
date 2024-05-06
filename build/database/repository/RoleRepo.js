"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Role_1 = require("../model/Role");
async function findByCode(code) {
    return Role_1.RoleModel.findOne({ code: code, status: true }).lean().exec();
}
async function findByCodes(codes) {
    return Role_1.RoleModel.find({ code: { $in: codes }, status: true })
        .lean()
        .exec();
}
exports.default = {
    findByCode,
    findByCodes,
};
//# sourceMappingURL=RoleRepo.js.map