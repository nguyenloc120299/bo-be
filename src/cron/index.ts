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


const initCron = () => {
  cron.schedule("* * * * *", async () => {
    const depositTransactions = await UserTransactionModel.find({
      point_type: POINT_TYPE_REAL,
      transaction_type: TRANSACTION_TYPE_RECHARGE,
      transaction_status: TRANSACTION_STATUS_PENDING,
      payment_type: { $ne: PAYMENT_METHOD_BEP20 },
    });
    if (!depositTransactions.length)
      return console.log("Not found Transaction deposit pending");
    depositTransactions.forEach(async (transation) => {
      if (
        new Date().getTime() >
        new Date(transation.createdAt).getTime() + MINUTES_15
      ) {
        transation.transaction_status = TRANSACTION_STATUS_CANCEL;
        await transation.save()
      }
    });
  });
};

export default initCron;
