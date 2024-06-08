import { Vip_PERCENT } from "../constants/define";
import { getValue, setValue } from "../redis";

export const initVip = async () => {
  console.log("====================================");
  console.log("init VIP");
  console.log("====================================");
  const vip1 = await getValue(Vip_PERCENT[1]);
  const vip2 = await getValue(Vip_PERCENT[1]);
  const vip3 = await getValue(Vip_PERCENT[1]);
  const vip4 = await getValue(Vip_PERCENT[1]);
  const vip5 = await getValue(Vip_PERCENT[1]);

  if (!vip1) setValue(Vip_PERCENT[1], 5 / 100);
  if (!vip2) setValue(Vip_PERCENT[2], 10 / 100);
  if (!vip3) setValue(Vip_PERCENT[3], 12 / 100);
  if (!vip4) setValue(Vip_PERCENT[4], 15 / 100);
  if (!vip5) setValue(Vip_PERCENT[5], 10 / 100);
};
