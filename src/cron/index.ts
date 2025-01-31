import cron from "node-cron";
import { UserTransactionModel } from "../database/model/UserTransation";
import {
  MINUTES_15,
  PAYMENT_METHOD_BEP20,
  POINT_TYPE_REAL,
  TRANSACTION_STATUS_CANCEL,
  TRANSACTION_STATUS_PENDING,
  TRANSACTION_TYPE_RECHARGE,
} from "../constants/define";
import axios from "axios";
import { getValue, setValue } from "../redis";

const getRateUSD = async () => {
  try {
    const res = await axios.get(
      "https://open.er-api.com/v6/latest/USD?apikey=TmbqfKIuJDo0O5Ip"
    );
    if (res && res?.data) {

      
      await setValue("price_usd", res?.data?.rates?.VND || 25000);
    }
  } catch (error) {
    console.log(error);
  }
};

const initCron = () => {
  // cron.schedule("* * * * *", async () => {
  //   const depositTransactions = await UserTransactionModel.find({
  //     point_type: POINT_TYPE_REAL,
  //     transaction_type: TRANSACTION_TYPE_RECHARGE,
  //     transaction_status: TRANSACTION_STATUS_PENDING,
  //     payment_type: { $ne: PAYMENT_METHOD_BEP20 },
  //   });
  //   if (!depositTransactions.length)
  //     return console.log("Not found Transaction deposit pending");
  //   depositTransactions.forEach(async (transation) => {
  //     if (
  //       new Date().getTime() >
  //       new Date(transation.createdAt).getTime() + MINUTES_15
  //     ) {
  //       transation.transaction_status = TRANSACTION_STATUS_CANCEL;
  //       await transation.save();
  //     }
  //   });
  // });

  cron.schedule("0 */8 * * *", async () => {
    getRateUSD();
  });

  cron.schedule("*/3 * * * *", async () => {
    let dataOtps = (await getValue("otps")) as any;
    dataOtps = dataOtps ? JSON.parse(dataOtps) : [];
    const expiredOtps = dataOtps.filter((otpData: any) => {
      return new Date().getTime() >= otpData.time;
    });
    

    expiredOtps.forEach(async (expiredOtp: any) => {
      const index = dataOtps.findIndex((otpData: any) => otpData.time === expiredOtp.time);
      if (index !== -1) {
        dataOtps.splice(index, 1);
        await setValue("otps", JSON.stringify(dataOtps));
      }
    });
    
  });
};

export default initCron;
