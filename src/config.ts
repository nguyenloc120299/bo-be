export const environment = process.env.NODE_ENV;
export const port = process.env.PORT;
export const timezone = process.env.TZ;
export const chat_id_tele = `${process.env.CHAT_ID}`;
export const db = {
  database_url: process.env.DATABASE_URL,
  name: process.env.DB_NAME || "",
  host: process.env.DB_HOST || "",
  port: process.env.DB_PORT || "",
  user: process.env.DB_USER || "",
  password: process.env.DB_USER_PWD || "",
  minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || "5"),
  maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || "10"),
};

export const tokenInfo = {
  accessTokenValidity: parseInt(process.env.ACCESS_TOKEN_VALIDITY_SEC || "0"),
  refreshTokenValidity: parseInt(process.env.REFRESH_TOKEN_VALIDITY_SEC || "0"),
  issuer: process.env.TOKEN_ISSUER || "",
  audience: process.env.TOKEN_AUDIENCE || "",
  apiTokenBotTele: `${process.env.API_TOKEN_TELE}`,
};

export const corsUrl = process.env.CORS_URL || "*";
