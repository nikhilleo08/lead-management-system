import { connectToDB, getClient } from "../prisma";
import server from "./api";
import envConfig from "./config";

console.log('config', envConfig)

server.listen(envConfig.API_PORT || "5000", async () => {
  await connectToDB()
  console.log(
    `The API server has successfully started. \nListening at ${
      envConfig.API_PORT || "http://localhost:5000"
    }`
  );
});

process.on("SIGINT", function () {
  getClient().$disconnect(); // Disconnect from Prisma
  console.log("Prisma Disconnected.");
  process.exit(0);
});
