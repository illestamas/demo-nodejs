"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validator_1 = __importDefault(require("validator"));
const router = express_1.default.Router();
router.get("/users/artworks/:reference", async (req, res) => {
    if (!req.params.reference) {
        return res.json({
            error: "[reference] must be provided!"
        });
    }
    if (!validator_1.default.isUUID(req.params.reference)) {
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
});
exports.default = router;
