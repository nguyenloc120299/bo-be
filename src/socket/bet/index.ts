import fs from "fs";
import { random } from "lodash";
import moment from "moment";
import path from "path";
import { Server } from "socket.io";
import { getSum, getValueFromPercent, randomInArray } from "../../helpers/bet";
import { getTradeValueCurrent } from "../binance";
import { getValue, setValue } from "../../redis";
import { UserController } from "../../controllers/user.controller";
import { betController } from "../../controllers/bet.controller";

interface BetData {
  lowPrice: number;
  highPrice: number;
  openPrice: number;
  closePrice: number;
  baseVolume: number;
  createDateTime: number;
  second: number;
  psychologicalIndicators: number;
  isBet: boolean;
}

const MAX_SECOND_BET = 30;
const MAX_SECOND_RESULT = 30;
const MAX_BET_RECORD = 102;

const dataPath = path.join(__dirname, "..", "..", "trade_data.json");

function writeData(data: any) {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([data]));
  }
  let list = fs.readFileSync(dataPath).toString() as any;
  list = list ? JSON.parse(list) || [] : [];
  list.push(data);
  if (list.length > MAX_BET_RECORD) {
    list.shift();
  }
  fs.writeFileSync(dataPath, JSON.stringify(list));
}

class Bet {
  private second: number;
  private isBet: boolean;
  private currentLowPrice: number;
  private currentClosePrice: number;
  private currentHighPrice: number;
  private currentOpenPrice: number;
  private currentBaseVolume: number;
  private createDateTime: number;
  private psychologicalIndicators: number;
  private io: Server;
  private bet_count: number;
  private condition_up: number;
  private condition_down: number;
  private bet_guess: string | null;
  private realPrice: number;
  private override_result: string | null;
  private initPrice: number;
  private previousClosePrice: number;

  constructor(io: Server, price: number) {
    this.second = 0;
    this.isBet = true;
    this.currentLowPrice = 0;
    this.currentClosePrice = price;
    this.currentLowPrice = this.currentClosePrice;
    this.currentHighPrice = this.currentClosePrice;
    this.currentOpenPrice = this.currentClosePrice;
    this.currentBaseVolume = random(1, 155);
    this.createDateTime = moment().valueOf();
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
  }

  private getPsychologicalIndicators(): number {
    let isAllowUpdate = randomInArray(["allow", "not", "not"]);
    if (!this.isBet || isAllowUpdate !== "allow") {
      return this.psychologicalIndicators;
    }
    return random(45, 59);
  }

  private getClosePrice(): void {
    if (!this.isBet && this.second === 1) {
      this.resetBetCondition();
    }
    if (this.isBet && this.second === 1) {
      getValue("bet_count").then((bet_count) => {
        if (bet_count) this.bet_count = +bet_count as any;
      });
      getValue("condition_up").then((condition_up) => {
        if (condition_up) this.condition_up = +condition_up as any;
      });
      getValue("condition_down").then((condition_down) => {
        if (condition_down) this.condition_down = +condition_down as any;
      });
    }
    if (!this.isBet && this.second <= 15) {
      getValue("override_result").then((override_result) => {
        this.override_result = override_result;
      });
    }

    if (this.override_result === "up" || this.override_result === "down") {
      if (this.second % 3) {
        this.currentClosePrice = getSum(
          this.override_result,
          this.currentClosePrice,
          random(1, 5)
        );
      } else {
        this.currentClosePrice = getSum(
          this.override_result === "up" ? "down" : "up",
          this.currentClosePrice,
          random(1, 2)
        );
      }
    } else {
      if (this.bet_count === 1) {
        let single_member_win_percent = parseInt("45");
        let randomValue = random(5, 20);
        let condition = null;
        if (this.condition_up > 0) {
          condition = getValueFromPercent(
            single_member_win_percent,
            "up",
            "down"
          );
        } else {
          condition = getValueFromPercent(
            single_member_win_percent,
            "down",
            "up"
          );
        }
        this.currentClosePrice = getSum(
          condition as any,
          this.currentClosePrice,
          randomValue
        );
      } else if (this.bet_count > 1) {
        if (this.condition_up > this.condition_down) {
          let condition = randomInArray(["up", "down"]);
          if (
            this.currentClosePrice > this.currentOpenPrice &&
            this.second < MAX_SECOND_RESULT - 4
          ) {
            condition = randomInArray(["up", "down", "down", "down", "down"]);
          }
          let randomValue = condition === "up" ? random(2, 7) : random(7, 15);
          this.currentClosePrice = getSum(
            condition as any,
            this.currentClosePrice,
            randomValue
          );
        } else {
          let condition = randomInArray(["up", "down"]);
          if (
            this.currentClosePrice < this.currentOpenPrice &&
            this.second < MAX_SECOND_RESULT - 4
          ) {
            condition = randomInArray(["up", "up", "up", "up", "down"]);
          }
          let randomValue = condition === "down" ? random(2, 7) : random(7, 15);
          this.currentClosePrice = getSum(
            condition as any,
            this.currentClosePrice,
            randomValue
          );
        }
      } else {
        this.realPrice = getTradeValueCurrent(this.initPrice);

        this.currentClosePrice = this.realPrice;
      }
    }
  }

  private getDataPrice(): BetData {
    this.getClosePrice();
    let currentBaseVolumeMin = this.currentBaseVolume - random(1, 15);
    let currentBaseVolumeMax = this.currentBaseVolume + random(1, 15);
    if (currentBaseVolumeMin < 0) {
      currentBaseVolumeMin = 1;
    }
    if (currentBaseVolumeMax > 200) {
      currentBaseVolumeMax = 200;
    }
    this.currentBaseVolume = random(currentBaseVolumeMin, currentBaseVolumeMax);

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
      this.createDateTime = moment().valueOf();
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

  private resetBetCondition(): void {
    setValue("override_result", "");
    setValue("bet_guess", "");
    setValue("bet_count", "0");
    setValue("condition_up", "0");
    setValue("condition_down", "0");
    this.override_result = null;
    this.bet_count = 0;
    this.condition_up = 0;
    this.condition_down = 0;
    this.bet_guess = null;
  }

  public start(): void {
    let data = this.getDataPrice();
  
    
    setInterval(() => {
      data = this.getDataPrice();

      if (this.second === 1) {
        writeData(data);
      }

      if (this.isBet && this.second === MAX_SECOND_BET) {
        setValue("bet_id", this.createDateTime.toString());
      }

      if (!this.isBet && this.second === 1) {
        getValue("bet_id").then((bet_id: any) => {
          if (bet_id) {
            betController
              .checkResult({
                bet_id,
                bet_condition_result:
                  this.currentOpenPrice > this.currentClosePrice
                    ? "down"
                    : "up",
                open_price: this.currentOpenPrice,
                close_price: this.currentClosePrice,
              })
              .then((result: any) => {
                if (!!result) {
                  this.io.to("MEMBER").emit("WE_RESULT", { bet_id, result });
                }
              });
          }
        });
      }

      setValue("is_bet", this.isBet as any);
      this.io.to("MEMBER").emit("WE_PRICE", data);

      let isAllowUpdate = randomInArray(["allow", "not", "not", "not"]);
      if (this.isBet && isAllowUpdate === "allow") {
        let changes = {
          meter_os: random(-8, 8),
          meter_su: random(-8, 8),
          meter_ma: random(-8, 8),
        } as any;
        Object.keys(changes).forEach((key) => {
          changes[key] =
            changes[key] > 90 ? 90 : changes[key] < -90 ? -90 : changes[key];
        });
        this.io.to("MEMBER").emit("WE_INDICATOR", changes);
      }
    }, 1000);
  }
}

export { Bet };
