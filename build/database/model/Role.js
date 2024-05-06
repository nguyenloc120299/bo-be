"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleModel = exports.RoleCode = exports.COLLECTION_NAME = exports.DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
exports.DOCUMENT_NAME = "Role";
exports.COLLECTION_NAME = "roles";
var RoleCode;
(function (RoleCode) {
    RoleCode["USER"] = "USER";
    RoleCode["ADMIN"] = "ADMIN";
})(RoleCode || (exports.RoleCode = RoleCode = {}));
const schema = new mongoose_1.Schema({
    code: {
        type: mongoose_1.Schema.Types.String,
        required: true,
        enum: Object.values(RoleCode),
    },
    status: {
        type: mongoose_1.Schema.Types.Boolean,
        default: true,
    },
    createdAt: {
        type: mongoose_1.Schema.Types.Date,
        required: true,
        select: false,
    },
    updatedAt: {
        type: mongoose_1.Schema.Types.Date,
        required: true,
        select: false,
    },
}, {
    versionKey: false,
});
schema.index({ code: 1, status: 1 });
exports.RoleModel = (0, mongoose_1.model)(exports.DOCUMENT_NAME, schema, exports.COLLECTION_NAME);
//# sourceMappingURL=Role.js.map