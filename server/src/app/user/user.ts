import express, { Request, Response } from "express";

import validator from "validator";

const router = express.Router();

router.get("/users/artworks/:reference",
  async(req: Request, res: Response) => {
    if (!req.params.reference) {
      return res.json({
        error: "[reference] must be provided!"
      });
    }

    if (!validator.isUUID(req.params.reference)) {
      return res.json({
        error: "[reference] must be a valid uuid!"
      });
    }

    const user = await global.db.user.findOne({
      attributes: [
        "reference"
      ],
      include: [
        {
          association: 'artworks',
          attributes: [
            "id"
          ]
        }
      ],
      where: {
        reference: req.params.reference
      }
    });

    if (!user) {
      return res.json({
        error: "[user] not found!"
      });
    }
    
    return res.json(user);
  }
);

export default router;