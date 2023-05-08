"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    // user
    await queryInterface.context.createTable("user", {
        id: {
            field: "id",
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            field: "email",
            type: sequelize_1.DataTypes.STRING,
            unique: true
        },
        reference: {
            field: "reference",
            type: sequelize_1.DataTypes.UUID,
            allowNull: false
        },
        password: {
            field: "password",
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        version: {
            field: "version",
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false
        }
    });
    // artwork
    await queryInterface.context.createTable("artwork", {
        id: {
            field: "id",
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            unique: true
        },
        userId: {
            field: "userId",
            type: sequelize_1.DataTypes.INTEGER,
            references: {
                model: "user",
                key: "id"
            }
        },
        created: {
            field: "created",
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        version: {
            field: "version",
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false
        }
    });
}
exports.up = up;
;
async function down(queryInterface) {
    await queryInterface.dropTable("user");
}
exports.down = down;
;
