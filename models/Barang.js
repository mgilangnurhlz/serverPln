import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

const Barang = db.define(
  "barang",
  {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 50],
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    code: {
      type: DataTypes.CHAR(12),
      allowNull: true,
      validate: {
        notEmpty: true,
      },
    },
    location: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    datein: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        notEmpty: true,
      },
    },
    dateout: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        notEmpty: true,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    freezeTableName: true,
  }
);

Users.hasMany(Barang);
Barang.belongsTo(Users, { foreignKey: "userId" });

export default Barang;
