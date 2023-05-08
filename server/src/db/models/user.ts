import { Sequelize, Model, DataTypes } from "sequelize";
import bcrypt from "bcrypt";

export interface User {
  id?: number,
  email: string,
  password: string
}

export default (sequelize: Sequelize) => {
  class User extends Model {
    static associate = function(models: any) {
      this.hasMany(models.artwork);
    };
  };

  User.init({
    id: {
      field: "id",
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reference: {
      field: "reference",
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    },
    email: {
      field: "email",
      type: DataTypes.STRING,
      unique: true
    },
    password: {
      field: "password",
      type: DataTypes.STRING,
      allowNull: false,
      async set(value: string) {
        // hash password for additional security. The higher the APPSETTING_SALT_ROUND value is, the more secure the algorithm becomes, but more CPU power is needed. 
        const salt = bcrypt.genSaltSync(parseInt(process.env.APPSETTING_SALT_ROUNDS));
        this.setDataValue('password', value ? bcrypt.hashSync(value, salt) : null);
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