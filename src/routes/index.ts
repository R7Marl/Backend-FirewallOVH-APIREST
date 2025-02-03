import { Express } from "express";
import authRouter from "@/routes/auth";

const setupRoutes = (app: Express) => {
  //app.use("/v1/servers", router);
  app.use("/v1/auth", authRouter);
  //app.use("/v1/ai", AIRouter);
};

export default setupRoutes;
