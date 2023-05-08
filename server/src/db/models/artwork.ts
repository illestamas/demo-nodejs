import { Sequelize, Model, DataTypes } from "sequelize";
import moment from "moment";

export interface Artwork {
  id?: number,
  userId: number
}

export default (sequelize: Sequelize) => {
  class Artwork extends Model {
    static associate = function(models: any) {
      this.belongsTo(models.user);
    };
  };

  Artwork.init({
    id: {
      field: "id",
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true
    },
    userId: {
      field: "userId",
      type: DataTypes.INTEGER
    },
    created: {
      field: "created",
      type: DataTypes.DATE,
      defaultValue: moment()
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