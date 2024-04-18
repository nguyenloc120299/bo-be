import WebSocket from "ws";
import { getProp } from "../../helpers/bet";
let isError = false;
let tradePreviousValue: number | null = null;

function makeSocket(): void {
  console.log("Connecting to binance...");
  const ws = new WebSocket("wss://stream.binance.com/stream");

  ws.on("open", () => {
    ws.send(
      JSON.stringify({
        method: "SUBSCRIBE",
        params: ["btcusdt@aggTrade"],
        id: 1,
      })
    );
  });

  ws.on("message", (data: WebSocket.Data) => {
    let json = JSON.parse(data.toString());
    tradePreviousValue = parseFloat(
      getProp(json, "data.p", tradePreviousValue)
    );
  });

  ws.on("close", () => {
    console.log("Disconnected from binance");
    if (!isError) makeSocket();
  });

  ws.on("error", (error: Error) => {
    isError = true;
    console.log("On error binance", error.message);
  });
}

makeSocket();

function getTradeValueCurrent(defaultValue: number): number {
  return tradePreviousValue || defaultValue;
}
export { getTradeValueCurrent };
