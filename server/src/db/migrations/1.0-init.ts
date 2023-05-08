import { DataTypes } from "sequelize";

export async function up(queryInterface: any): Promise<void> {
  // user
  await queryInterface.context.createTable("user", {
    id: {
      field: "id",
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      field: "email",
      type: DataTypes.STRING,
      unique: true
    },
    reference: {
      field: "reference",
      type: DataTypes.UUID,
      allowNull: false
    },
    password: {
      field: "password",
      type: DataTypes.STRING,
      allowNull: false
    },
    version: {
      field: "version",
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  // artwork
  await queryInterface.context.createTable("artwork", {
    id: {
      field: "id",
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true
    },
    userId: {
      field: "userId",
      type: DataTypes.INTEGER,
      references: {
        model: "user",
        key: "id"
      }
    },
    created: {
      field: "created",
      type: DataTypes.DATE,
      allowNull: false
    },
    version: {
      field: "version",
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });
};

export async function down(queryInterface: any): Promise<void> {
  await queryInterface.dropTable("user");
};