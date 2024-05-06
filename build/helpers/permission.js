"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_1 = require("../core/ApiError");
exports.default = (permission) => (req, res, next) => {
    var _a;
    try {
        if (!((_a = req.apiKey) === null || _a === void 0 ? void 0 : _a.permissions))
            return next(new ApiError_1.ForbiddenError("Permission Denied"));
        const exists = req.apiKey.permissions.find((entry) => entry === permission);
        if (!exists)
            return next(new ApiError_1.ForbiddenError("Permission Denied"));
        next();
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=permission.js.map