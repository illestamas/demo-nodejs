import express, {
  Request,
  Response,
  NextFunction
} from "express";

import { LogLevel } from "@ts/winston";
import { GeneralStatus } from "@ts/system";

import moment from "moment";

const router = express.Router();

router.get("/system",
  async(req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      return res.status(401).json({
        error: "[authorization] header must be provided!"
      });
    }

    if (req.headers.authorization !== process.env.APPSETTING_ADMIN_SECRET) {
      global.logger.log(LogLevel.warn, "Invalid admin secret provided!");

      return res.status(401).json({
        error: "[authorization] header invalid!"
      });
    }

    return next();
  },
  async (req: Request, res: Response) => {
    const generalStatus: GeneralStatus = {
      uptime: process.uptime(),
      timestamp: moment()
    }
    global.system.general = generalStatus;

    return res.json(global.system);
  }
);

export default router;