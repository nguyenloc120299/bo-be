"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRANSACTION_TYPE_WITHDRAWAL = exports.TRANSACTION_TYPE_RECHARGE = exports.TRANSACTION_TYPE_BET = exports.BET_CONDITION_DOWN = exports.BET_CONDITION_UP = exports.POINT_TYPE_DEMO = exports.POINT_TYPE_REAL = exports.ENCRYPT_KEY = exports.CACHE_SETTING = exports.GUARD_MEMBER = exports.ORDER_STATUS_CANCELED = exports.ORDER_STATUS_DELIVERED = exports.ORDER_STATUS_DELIVERING = exports.ORDER_STATUS_IN_PROCESS = exports.ORDER_STATUS_NEW = exports.PAYMENT_METHOD_COD = exports.FORM_TYPE_HIDDEN = exports.FORM_TYPE_DATETIME = exports.FORM_TYPE_DATE = exports.FORM_TYPE_TIME = exports.FORM_TYPE_PASSWORD = exports.FORM_TYPE_IMAGE_MULTI = exports.FORM_TYPE_URL = exports.FORM_TYPE_IMAGE = exports.FORM_TYPE_SELECT_MULTI = exports.FORM_TYPE_SELECT_LEVEL_MULTI = exports.FORM_TYPE_SELECT_LEVEL = exports.FORM_TYPE_SELECT = exports.FORM_TYPE_EDITOR = exports.FORM_TYPE_CURRENCY = exports.FORM_TYPE_NUMBER = exports.FORM_TYPE_TEXTAREA = exports.FORM_TYPE_COLOR = exports.FORM_TYPE_EMAIL = exports.FORM_TYPE_MAP = exports.FORM_TYPE_FILE = exports.FORM_TYPE_TEXT = exports.ADMINISTRATOR = exports.SUPERADMINISTRATOR = exports.DEVICE_WEB = exports.GENDER_FEMALE = exports.GENDER_MALE = exports.GENDER_UNKNOWN = exports.PICKER_FORMAT_DATE = exports.PICKER_FORMAT_DATETIME = exports.HUMAN_FORMAT_DATE = exports.DEFAULT_LANG = exports.BIRTHDAY_FORMAT_DATE = exports.MYSQL_FORMAT_DATE = exports.TOKEN_LIFE_TIME = void 0;
exports.CHALLENGE_SCHEDULE_WEEK = exports.CHALLENGE_SCHEDULE_MONTH = exports.CHALLENGE_TYPE_AGENCY = exports.CHALLENGE_TYPE_TRADING = exports.COMMISSION_TYPE_TRADE = exports.COMMISSION_TYPE_VIP = exports.USER_MODE_UNLIMITED = exports.USER_MODE_MEMBER = exports.USER_MODE_TRAIL = exports.PAYMENT_TYPE_USDT = exports.PAYMENT_TYPE_BANK = exports.TRANSACTION_STATUS_CANCEL = exports.TRANSACTION_STATUS_PROCESSING = exports.TRANSACTION_STATUS_PENDING = exports.TRANSACTION_STATUS_FINISH = exports.TRANSACTION_TYPE_TRANSFER = exports.TRANSACTION_TYPE_REF = exports.TRANSACTION_TYPE_BUY_VIP = void 0;
/*
 * Other config
 */
exports.TOKEN_LIFE_TIME = 60 * 24 * 30 * 12; // 60 phút * 24 giờ * 30 ngày * 12 tháng ~ 1 năm.
exports.MYSQL_FORMAT_DATE = "Y-m-d H:i:s";
exports.BIRTHDAY_FORMAT_DATE = "Y-m-d";
exports.DEFAULT_LANG = "vi";
exports.HUMAN_FORMAT_DATE = "H:i:s d/m/Y";
// km unit
exports.PICKER_FORMAT_DATETIME = "YYYY-MM-DD HH:mm:ss";
exports.PICKER_FORMAT_DATE = "YYYY-MM-DD";
/*
 * Google mode transit
 */
/*
 * Gender
 */
exports.GENDER_UNKNOWN = "UNKNOWN";
exports.GENDER_MALE = "MALE";
exports.GENDER_FEMALE = "FEMALE";
/*
 * Device type
 */
exports.DEVICE_WEB = "WEB";
exports.SUPERADMINISTRATOR = "superadministrator";
exports.ADMINISTRATOR = "administrator";
/*
 * Minutes on a session
 */
/*
 * Form type
 */
exports.FORM_TYPE_TEXT = "text";
exports.FORM_TYPE_FILE = "file";
exports.FORM_TYPE_MAP = "map";
exports.FORM_TYPE_EMAIL = "email";
exports.FORM_TYPE_COLOR = "color";
exports.FORM_TYPE_TEXTAREA = "textarea";
exports.FORM_TYPE_NUMBER = "number";
exports.FORM_TYPE_CURRENCY = "currency";
exports.FORM_TYPE_EDITOR = "editor";
exports.FORM_TYPE_SELECT = "select";
exports.FORM_TYPE_SELECT_LEVEL = "select_level";
exports.FORM_TYPE_SELECT_LEVEL_MULTI = "select_level_multi";
exports.FORM_TYPE_SELECT_MULTI = "select_multi";
exports.FORM_TYPE_IMAGE = "image";
exports.FORM_TYPE_URL = "url";
exports.FORM_TYPE_IMAGE_MULTI = "image_multi";
exports.FORM_TYPE_PASSWORD = "password";
exports.FORM_TYPE_TIME = "time";
exports.FORM_TYPE_DATE = "date";
exports.FORM_TYPE_DATETIME = "datetime";
exports.FORM_TYPE_HIDDEN = "hidden";
exports.PAYMENT_METHOD_COD = "COD";
exports.ORDER_STATUS_NEW = "NEW";
exports.ORDER_STATUS_IN_PROCESS = "IN_PROCESS";
exports.ORDER_STATUS_DELIVERING = "DELIVERING";
exports.ORDER_STATUS_DELIVERED = "DELIVERED";
exports.ORDER_STATUS_CANCELED = "CANCELED";
exports.GUARD_MEMBER = "MEMBER";
/*
 * Cache name
 */
exports.CACHE_SETTING = "cache_setting";
exports.ENCRYPT_KEY = "88jQvSSszoeaXCEusHArQjz2By54yPwy";
exports.POINT_TYPE_REAL = "real";
exports.POINT_TYPE_DEMO = "demo";
exports.BET_CONDITION_UP = "up";
exports.BET_CONDITION_DOWN = "down";
exports.TRANSACTION_TYPE_BET = "bet";
exports.TRANSACTION_TYPE_RECHARGE = "recharge";
exports.TRANSACTION_TYPE_WITHDRAWAL = "withdrawal";
exports.TRANSACTION_TYPE_BUY_VIP = "buy_vip";
exports.TRANSACTION_TYPE_REF = "ref";
exports.TRANSACTION_TYPE_TRANSFER = "transfer";
exports.TRANSACTION_STATUS_FINISH = "finish";
exports.TRANSACTION_STATUS_PENDING = "pending";
exports.TRANSACTION_STATUS_PROCESSING = "processing";
exports.TRANSACTION_STATUS_CANCEL = "cancel";
exports.PAYMENT_TYPE_BANK = "bank";
exports.PAYMENT_TYPE_USDT = "usdt";
exports.USER_MODE_TRAIL = "trial";
exports.USER_MODE_MEMBER = "member";
exports.USER_MODE_UNLIMITED = "unlimited";
exports.COMMISSION_TYPE_VIP = "vip";
exports.COMMISSION_TYPE_TRADE = "trade";
exports.CHALLENGE_TYPE_TRADING = "trading";
exports.CHALLENGE_TYPE_AGENCY = "agency";
exports.CHALLENGE_SCHEDULE_MONTH = "month";
exports.CHALLENGE_SCHEDULE_WEEK = "week";
//# sourceMappingURL=define.js.map