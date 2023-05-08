"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const moment_1 = __importDefault(require("moment"));
exports.default = (sequelize) => {
    class Artwork extends sequelize_1.Model {
        static associate = function (models) {
            this.belongsTo(models.user);
        };
    }
    ;
    Artwork.init({
        id: {
            field: "id",
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            unique: true
        },
        userId: {
            field: "userId",
            type: sequelize_1.DataTypes.INTEGER
        },
        created: {
            field: "created",
            type: sequelize_1.DataTypes.DATE,
            defaultValue: (0, moment_1.default)()
        }
    }, {
        sequelize,
        modelName: "artwork",
        tableName: "artwork",
        timestamps: false,
        freezeTableName: true,
        version: true // optimistic locking
    });
    return Artwork;
};
