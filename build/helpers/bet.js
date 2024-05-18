"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTradeRate = exports.getSum = exports.randomInArray = exports.getValueFromPercent = exports.random = exports.getProp = void 0;
const axios_1 = __importDefault(require("axios"));
const getProp = (object, keys, defaultVal) => {
    keys = Array.isArray(keys) ? keys : keys.split(".");
    let result = object[keys[0]];
    if (result && keys.length > 1) {
        return (0, exports.getProp)(result, keys.slice(1));
    }
    return result === undefined ? defaultVal : result;
};
exports.getProp = getProp;
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.random = random;
function getValueFromPercent(percent, valueTrue, valueFalse) {
    const trueArray = Array(percent).fill(valueTrue);
    const falseArray = Array(100 - percent).fill(valueFalse);
    const array = [...trueArray, ...falseArray]
        .map((a) => ({ sort: Math.random(), value: a }))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => a.value);
    return randomInArray(array);
}
exports.getValueFromPercent = getValueFromPercent;
function randomInArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}
exports.randomInArray = randomInArray;
function getSum(condition, value1, value2) {
    const operators = {
        up: (a, b) => a + b,
        down: (a, b) => a - b,
    };
    return operators[condition](value1, value2);
}
exports.getSum = getSum;
async function getTradeRate() {
    try {
        const response = await axios_1.default.get("https://api.coingecko.com/api/v3/simple/price", {
            params: {
                ids: "bitcoin",
                vs_currencies: "usd",
            },
        });
        return response.data.bitcoin.usd;
    }
    catch (error) {
        console.log(error);
    }
}
exports.getTradeRate = getTradeRate;
//# sourceMappingURL=bet.js.map