import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import * as errorHandler from "./helpers/errorHandler";
import router from "./routes";
import { PrismaClient } from "@prisma/client";
import { useGoogleStrategy } from "./helpers/passport";
import passport from "passport";
import { startScheduler } from "./helpers/scheduler";

class App {
  public express: express.Application;
  public prismaClient: PrismaClient;

  constructor() {
    this.express = express();
    this.setMiddlewares();
    this.setRoutes();
    this.catchErrors();
    this.initializePassport();
    startScheduler();
  }

  private setMiddlewares(): void {
    this.express.use(cors());
    this.express.use(morgan("dev"));
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(helmet());
    this.express.use(express.static("public"));
    this.express.use(passport.initialize());
  }

  private initializePassport(): void {
    useGoogleStrategy();
  }

  private setRoutes(): void {
    this.express.use("/", router);
  }

  private catchErrors(): void {
    this.express.use(errorHandler.notFound);
    this.express.use(errorHandler.internalServerError);
  }
}

export default new App().express;
