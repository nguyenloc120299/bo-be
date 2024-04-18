import app from "./app";
import { port } from "./config";
app
  .listen(port, () => {
    console.log(`Server running on port : ${port}`);
  })
  .on("error", (e) => console.log(e));
