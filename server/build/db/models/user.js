"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.default = (sequelize) => {
    class User extends sequelize_1.Model {
        static associate = function (models) {
            this.hasMany(models.artwork);
        };
    }
    ;
    User.init({
        id: {
            field: "id",
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        reference: {
            field: "reference",
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.UUIDV4
        },
        email: {
            field: "email",
            type: sequelize_1.DataTypes.STRING,
            unique: true
        },
        password: {
            field: "password",
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            async set(value) {
                // hash password for additional security. The higher the APPSETTING_SALT_ROUND value is, the more secure the algorithm becomes, but more CPU power is needed. 
                const salt = bcrypt_1.default.genSaltSync(parseInt(process.env.APPSETTING_SALT_ROUNDS));
                this.setDataValue('password', value ? bcrypt_1.default.hashSync(value, salt) : null);
            }
        }
    }, {
        sequelize,
        modelName: "user",
        tableName: "user",
        timestamps: false,
        freezeTableName: true,
        version: true // optimistic locking
    });
    return User;
};
