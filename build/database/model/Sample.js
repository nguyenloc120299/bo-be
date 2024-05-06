"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SampleModel = exports.Category = exports.COLLECTION_NAME = exports.DOCUMENT_NAME = void 0;
const mongoose_1 = require("mongoose");
exports.DOCUMENT_NAME = "Sample";
exports.COLLECTION_NAME = "samples";
var Category;
(function (Category) {
    Category["ABC"] = "ABC";
    Category["XYZ"] = "XYZ";
})(Category || (exports.Category = Category = {}));
const schema = new mongoose_1.Schema({
    category: {
        type: mongoose_1.Schema.Types.String,
        required: true,
        enum: Object.values(Category),
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
exports.SampleModel = (0, mongoose_1.model)(exports.DOCUMENT_NAME, schema, exports.COLLECTION_NAME);
//# sourceMappingURL=Sample.js.map