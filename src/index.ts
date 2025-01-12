import server from "./api";
import envConfig from "./config";
import prismaClient from "../prisma"

server.listen(envConfig.API_PORT || "5000", () => {
  console.log(
    `The API server has successfully started. \nListening at ${
      envConfig.API_PORT || "http://localhost:5000"
    }`
  );
});

process.on("SIGINT", function () {
  prismaClient.$disconnect(); // Disconnect from Prisma
  console.log("Prisma Disconnected.");
  process.exit(0);
});
