import express, { Request, Response, NextFunction } from "express";

import { listArtworks, getArtwork } from "@api/artic";
import { Artwork } from "@ts/artic";

const router = express.Router();

router.get("/artworks/",
  async(req: Request, res: Response, next: NextFunction) => {
    if (!req.query.pageNumber || isNaN(parseInt(req.query.pageNumber.toString()))) {
      return res.json({
        error: "[pageNumber] must be a valid number!"
      });
    }

    if (!req.query.pageLimit || isNaN(parseInt(req.query.pageLimit.toString()))) {
      return res.json({
        error: "[pageLimit] must be a valid number!"
      });
    }

    return next();
  },
  async (req: Request, res: Response) => {
    const pageNumber: number = parseInt(req.query.pageNumber.toString());
    const pageLimit: number = parseInt(req.query.pageLimit.toString());

    const artworks: Array<Artwork> = await listArtworks(pageNumber, pageLimit);

    return res.json(artworks);
  }
);

router.get("/artworks/:id",
  async(req: Request, res: Response) => {
    if (!req.params.id || isNaN(parseInt(req.params.id.toString()))) {
      return res.json({
        error: "[id] must be a valid number!"
      });
    }
    
    const artwork: Artwork = await getArtwork(parseInt(req.params.id.toString()));

    return res.json(artwork);
  }
);

router.post("/artworks/purchase/:id",
  async(req: Request, res: Response) => {
    if (!req.params.id || isNaN(parseInt(req.params.id.toString()))) {
      return res.json({
        error: "[id] must be a valid number!"
      });
    }

    // check if artwork exists on ARTIC
    const artwork: Artwork = await getArtwork(parseInt(req.params.id.toString()));

    if (artwork?.error) {
      return res.json({
        error: "Artwork does not exist in catalogue!"
      });
    }

     /* 
      - first we need to check if the particular artwork already belongs to a user
      - if not, we need to add it to the artwork to the user

      It's possible that between these two operations another user also
      tries to purchase the same artwork at the same time, creating a race condition.
      We can handle that by adding a unique constrain to the artwork's id field, so
      it won't be possible to create the artwork twice, thus handling such case.

      Alternatively a lock can also be added on the table while performing the operation
      to deal with the race condition by using a transaction.
    */

    const artworkLocal = await global.db.artwork.findOne({
      where: {
        id: parseInt(req.params.id.toString())
      }
    });

    if (artworkLocal) {
      return res.json({
        error: "Artwork is not for sale!"
      });
    }

    // as we only store the current user's reference in jwt, we need to get it's Id first
    const user = await global.db.user.findOne({
      attributes: [
        "id"
      ],
      where: {
        reference: req.user.reference
      }
    });

    // add artwork
    await global.db.artwork.create({
      id: parseInt(req.params.id.toString()),
      userId: user.id
    });

    return res.json({
      message: "Purchase has been successful!",
      artwork: artwork
    });
  }
);

export default router;