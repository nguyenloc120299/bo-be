"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTradeValueCurrent = void 0;
const ws_1 = __importDefault(require("ws"));
const bet_1 = require("../../helpers/bet");
let isError = false;
let tradePreviousValue = null;
function makeSocket() {
    console.log("Connecting to binance...");
    const ws = new ws_1.default("wss://stream.binance.com/stream");
    ws.on("open", () => {
        ws.send(JSON.stringify({
            method: "SUBSCRIBE",
            params: ["btcusdt@aggTrade"],
            id: 1,
        }));
    });
    ws.on("message", (data) => {
        let json = JSON.parse(data.toString());
        tradePreviousValue = parseFloat((0, bet_1.getProp)(json, "data.p", tradePreviousValue));
    });
    ws.on("close", () => {
        console.log("Disconnected from binance");
        if (!isError)
            makeSocket();
    });
    ws.on("error", (error) => {
        isError = true;
        console.log("On error binance", error.message);
    });
}
makeSocket();
function getTradeValueCurrent(defaultValue) {
    return tradePreviousValue || defaultValue;
}
exports.getTradeValueCurrent = getTradeValueCurrent;
//# sourceMappingURL=index.js.map