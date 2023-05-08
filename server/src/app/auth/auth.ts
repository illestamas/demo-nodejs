import express, { Request, Response, NextFunction } from "express";
import { compareSync } from "bcrypt";

import validate from 'deep-email-validator';
import * as jwt from "jsonwebtoken";

const router = express.Router();

/* middleware for authenticating jwt token across the application */
router.use('/', async function(req: Request, res: Response, next: NextFunction) {
  // skip jwt check for endpoints
  if (req.url.includes("/auth") || req.url.includes("/system")) {
    return next();
  }

  if (!req.headers.authorization) {
    return res.status(401).json({
      error: "[jwt token] must be provided in the Authorization header!"
    });
  }

  jwt.verify(req.headers.authorization.toString(), process.env.APPSETTING_JWT_SECRET, function(error, decoded: any) {
    if (error) {
      return res.status(401).json({
        error: "[jwt token] invalid!"
      });
    }

    // add user to "request"
    req.user = decoded.user;

    return next();
  });
});

router.post("/auth",
  async(req: Request, res: Response, next: NextFunction) => {
    if (!req.body?.email) {
      return res.json({
        error: "[email] must be populated!"
      });
    }

    if (!req.body?.password) {
      return res.json({
        error: "[password] must be populated!"
      });
    }

    // validate email making sure it is a valid address that actually exists
    if (process.env.APPSETTING_EMAIL_VALIDATION === "advanced") {
      const isEmailValid = (await validate(req.body.email)).valid;

      if (!isEmailValid) {
        return res.json({
          error: "[email] invalid!"
        });
      }
    }

    return next();
  },
  async (req: Request, res: Response, next: NextFunction) => {
    // fetch user from db based on email
    const user = await global.db.user.findOne({
      attributes: [
        "reference",
        "password"
      ],
      where: {
        email: req.body.email
      }
    });

    if (!user) {
      return res.json({
        error: "[email] not found!"
      });
    }

    // As password is hashed on the backend, use "bcrypt" to compare the hashed password with the plain one provided by the user
    const isPasswordMatch = compareSync(req.body.password.toString(), user.getDataValue("password"));
    if (!isPasswordMatch) {
      return res.json({
        error: "[password] invalid!"
      });
    }

    // provide jwt token for the user.
    
    /* 
      As JWT is public and can be decoded, user "reference" is used instead of user "Id" to link to a user object.
      "Id" can give information on how many records are in a table, therefore it's safer to use a uuid instead.
    */
    const token = jwt.sign({
      user: {
        reference: user.getDataValue("reference")
      }
    }, process.env.APPSETTING_JWT_SECRET, {
      expiresIn: process.env.APPSETTING_JWT_EXPIRATION,
      algorithm: "HS256"
    });
    
    return res.json({
      token
    });
  }
);

router.get('/auth/refresh', async function(req: Request, res: Response, next: NextFunction) {
  if (!req.headers.authorization) {
    return res.status(401).json({
      error: "[jwt token] must be provided in the Authorization header!"
    });
  }

  jwt.verify(req.headers.authorization.toString(), process.env.APPSETTING_JWT_SECRET, function(error, decoded: any) {
    if (error) {
      return res.status(401).json({
        error: "[jwt token] invalid!"
      });
    }

    const token = jwt.sign({
      user: decoded.user
    }, process.env.APPSETTING_JWT_SECRET, {
      expiresIn: process.env.APPSETTING_JWT_EXPIRATION,
      algorithm: "HS256"
    });
    
    return res.json({
      token
    });
  });
});

export default router;