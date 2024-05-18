"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bet = void 0;
const fs_1 = __importDefault(require("fs"));
const lodash_1 = require("lodash");
const moment_1 = __importDefault(require("moment"));
const path_1 = __importDefault(require("path"));
const bet_1 = require("../../helpers/bet");
const binance_1 = require("../binance");
const redis_1 = require("../../redis");
const bet_controller_1 = require("../../controllers/bet.controller");
const admin_controller_1 = require("../../controllers/admin/admin.controller");
const MAX_SECOND_BET = 30;
const MAX_SECOND_RESULT = 30;
const MAX_BET_RECORD = 102;
const dataPath = path_1.default.join(__dirname, "..", "..", "trade_data.json");
function writeData(data) {
    if (!fs_1.default.existsSync(dataPath)) {
        fs_1.default.writeFileSync(dataPath, JSON.stringify([data]));
    }
    let list = fs_1.default.readFileSync(dataPath).toString();
    list = list ? JSON.parse(list) || [] : [];
    list.push(data);
    if (list.length > MAX_BET_RECORD) {
        list.shift();
    }
    fs_1.default.writeFileSync(dataPath, JSON.stringify(list));
}
class Bet {
    constructor(io, price) {
        this.second = 0;
        this.isBet = true;
        this.currentLowPrice = 0;
        this.currentClosePrice = price;
        this.currentLowPrice = this.currentClosePrice;
        this.currentHighPrice = this.currentClosePrice;
        this.currentOpenPrice = this.currentClosePrice;
        this.currentBaseVolume = (0, lodash_1.random)(1, 155);
        this.createDateTime = (0, moment_1.default)().valueOf();
        this.psychologicalIndicators = 50;
        this.io = io;
        this.bet_count = 0;
        this.condition_up = 0;
        this.condition_down = 0;
        this.bet_guess = null;
        this.realPrice = price;
        this.override_result = null;
        this.initPrice = price;
        this.previousClosePrice = 0;
        this.member_win_percent = 50;
    }
    getPsychologicalIndicators() {
        let isAllowUpdate = (0, bet_1.randomInArray)(["allow", "not", "not"]);
        if (!this.isBet || isAllowUpdate !== "allow") {
            return this.psychologicalIndicators;
        }
        return (0, lodash_1.random)(45, 59);
    }
    getClosePrice() {
        if (!this.isBet && this.second === 1) {
            this.resetBetCondition();
        }
        if (this.isBet && this.second === 1) {
            (0, redis_1.getValue)("bet_count").then((bet_count) => {
                if (bet_count)
                    this.bet_count = +bet_count;
            });
            (0, redis_1.getValue)("condition_up").then((condition_up) => {
                if (condition_up)
                    this.condition_up = +condition_up;
            });
            (0, redis_1.getValue)("condition_down").then((condition_down) => {
                if (condition_down)
                    this.condition_down = +condition_down;
            });
            (0, redis_1.getValue)("member_win_percent").then((member_win_percent) => {
                if (member_win_percent) {
                    this.member_win_percent = parseInt(member_win_percent);
                }
            });
        }
        if (!this.isBet && this.second <= 20) {
            (0, redis_1.getValue)("override_result").then((override_result) => {
                this.override_result = override_result;
            });
        }
        if (this.override_result === "up" || this.override_result === "down") {
            if (this.second % 3) {
                this.currentClosePrice = (0, bet_1.getSum)(this.override_result, this.currentClosePrice, (0, lodash_1.random)(1, 10));
            }
            else {
                this.currentClosePrice = (0, bet_1.getSum)(this.override_result === "up" ? "down" : "up", this.currentClosePrice, (0, lodash_1.random)(1, 5));
            }
        }
        else {
            if (this.bet_count === 1) {
                let single_member_win_percent = this.member_win_percent;
                let randomValue = (0, lodash_1.random)(1, 5);
                let condition = null;
                if (this.condition_up > 0) {
                    condition = (0, bet_1.getValueFromPercent)(single_member_win_percent, "up", "down");
                }
                else {
                    condition = (0, bet_1.getValueFromPercent)(single_member_win_percent, "down", "up");
                }
                this.currentClosePrice = (0, bet_1.getSum)(condition, this.currentClosePrice, randomValue);
            }
            else if (this.bet_count > 1) {
                if (this.condition_up > this.condition_down) {
                    let condition = (0, bet_1.randomInArray)(["up", "down"]);
                    if (this.currentClosePrice > this.currentOpenPrice &&
                        this.second < MAX_SECOND_RESULT - 4) {
                        condition = (0, bet_1.randomInArray)(["up", "down", "down", "down", "down"]);
                    }
                    let randomValue = condition === "up" ? (0, lodash_1.random)(2, 7) : (0, lodash_1.random)(7, 15);
                    this.currentClosePrice = (0, bet_1.getSum)(condition, this.currentClosePrice, randomValue);
                }
                else {
                    let condition = (0, bet_1.randomInArray)(["up", "down"]);
                    if (this.currentClosePrice < this.currentOpenPrice &&
                        this.second < MAX_SECOND_RESULT - 4) {
                        condition = (0, bet_1.randomInArray)(["up", "up", "up", "up", "down"]);
                    }
                    let randomValue = condition === "down" ? (0, lodash_1.random)(2, 7) : (0, lodash_1.random)(7, 15);
                    this.currentClosePrice = (0, bet_1.getSum)(condition, this.currentClosePrice, randomValue);
                }
            }
            else {
                this.realPrice = (0, binance_1.getTradeValueCurrent)(this.initPrice);
                this.currentClosePrice = this.realPrice;
            }
        }
    }
    getDataPrice() {
        this.getClosePrice();
        let currentBaseVolumeMin = this.currentBaseVolume - (0, lodash_1.random)(1, 15);
        let currentBaseVolumeMax = this.currentBaseVolume + (0, lodash_1.random)(1, 15);
        if (currentBaseVolumeMin < 0) {
            currentBaseVolumeMin = 1;
        }
        if (currentBaseVolumeMax > 200) {
            currentBaseVolumeMax = 200;
        }
        this.currentBaseVolume = (0, lodash_1.random)(currentBaseVolumeMin, currentBaseVolumeMax);
        if (this.currentHighPrice < this.currentClosePrice) {
            this.currentHighPrice = this.currentClosePrice;
        }
        if (this.currentLowPrice > this.currentClosePrice) {
            this.currentLowPrice = this.currentClosePrice;
        }
        if (--this.second < 1) {
            this.isBet = !this.isBet;
            this.second = this.isBet ? MAX_SECOND_BET : MAX_SECOND_RESULT;
            this.currentLowPrice = this.currentClosePrice;
            this.currentHighPrice = this.currentClosePrice;
            this.createDateTime = (0, moment_1.default)().valueOf();
            this.currentOpenPrice = this.previousClosePrice || this.currentClosePrice;
        }
        this.previousClosePrice = this.currentClosePrice;
        return {
            lowPrice: this.currentLowPrice,
            highPrice: this.currentHighPrice,
            openPrice: this.currentOpenPrice,
            closePrice: this.currentClosePrice,
            baseVolume: this.currentBaseVolume,
            createDateTime: this.createDateTime,
            second: this.second,
            psychologicalIndicators: this.getPsychologicalIndicators(),
            isBet: this.isBet,
        };
    }
    resetBetCondition() {
        (0, redis_1.setValue)("override_result", "");
        (0, redis_1.setValue)("bet_guess", "");
        (0, redis_1.setValue)("bet_count", "0");
        (0, redis_1.setValue)("condition_up", "0");
        (0, redis_1.setValue)("condition_down", "0");
        this.override_result = null;
        this.bet_count = 0;
        this.condition_up = 0;
        this.condition_down = 0;
        this.bet_guess = null;
    }
    start() {
        let data = this.getDataPrice();
        setInterval(() => {
            data = this.getDataPrice();
            if (this.second === 1) {
                writeData(data);
            }
            if (this.isBet && this.second === MAX_SECOND_BET) {
                console.log(this.createDateTime.toString());
                (0, redis_1.setValue)("bet_id", this.createDateTime.toString());
            }
            if (!this.isBet && this.second === 1) {
                (0, redis_1.getValue)("bet_id").then((bet_id) => {
                    if (bet_id) {
                        bet_controller_1.betController
                            .checkResult({
                            bet_id,
                            bet_condition_result: this.currentOpenPrice > this.currentClosePrice
                                ? "down"
                                : "up",
                            open_price: this.currentOpenPrice,
                            close_price: this.currentClosePrice,
                        })
                            .then((result) => {
                            if (!!result) {
                                this.io.to("MEMBER").emit("WE_RESULT", { bet_id, result });
                            }
                        });
                    }
                });
            }
            (0, redis_1.setValue)("is_bet", this.isBet);
            this.io.to("MEMBER").emit("WE_PRICE", data);
            let isAllowUpdate = (0, bet_1.randomInArray)(["allow", "not", "not", "not"]);
            if (this.isBet && isAllowUpdate === "allow") {
                let changes = {
                    meter_os: (0, lodash_1.random)(-8, 8),
                    meter_su: (0, lodash_1.random)(-8, 8),
                    meter_ma: (0, lodash_1.random)(-8, 8),
                };
                Object.keys(changes).forEach((key) => {
                    changes[key] =
                        changes[key] > 90 ? 90 : changes[key] < -90 ? -90 : changes[key];
                });
                this.io.to("MEMBER").emit("WE_INDICATOR", changes);
            }
            admin_controller_1.AdminControllers.getAnalyticData().then((res) => {
                this.io.to("MEMBER").emit("analytic", res);
            });
        }, 1000);
    }
}
exports.Bet = Bet;
//# sourceMappingURL=index.js.map