"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsUrl = exports.tokenInfo = exports.db = exports.timezone = exports.port = exports.environment = void 0;
exports.environment = process.env.NODE_ENV;
exports.port = process.env.PORT;
exports.timezone = process.env.TZ;
exports.db = {
    database_url: process.env.DATABASE_URL,
    name: process.env.DB_NAME || "",
    host: process.env.DB_HOST || "",
    port: process.env.DB_PORT || "",
    user: process.env.DB_USER || "",
    password: process.env.DB_USER_PWD || "",
    minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || "5"),
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || "10"),
};
exports.tokenInfo = {
    accessTokenValidity: parseInt(process.env.ACCESS_TOKEN_VALIDITY_SEC || "0"),
    refreshTokenValidity: parseInt(process.env.REFRESH_TOKEN_VALIDITY_SEC || "0"),
    issuer: process.env.TOKEN_ISSUER || "",
    audience: process.env.TOKEN_AUDIENCE || "",
};
exports.corsUrl = process.env.CORS_URL || "*";
//# sourceMappingURL=config.js.map