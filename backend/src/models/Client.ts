import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Client extends Model {
  public id!: string;
  public name!: string;
  public phone!: string;
  public email!: string | null;
  public address!: string | null;

  public createdAt!: Date;
  public updatedAt!: Date;
}

Client.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
  },

  {
    sequelize,
    tableName: "clients",
    timestamps: true,
  },
);

export default Client;
