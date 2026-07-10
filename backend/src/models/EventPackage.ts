import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { LineItem } from './Quotation';

class EventPackage extends Model {
	public id!: string;
	public name!: string;
	public description!: string | null;
	public lineItems!: LineItem[];
	public createdAt!: Date;
	public updatedAt!: Date;
}

EventPackage.init(
	{
		id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
		name: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.TEXT, allowNull: true },
		lineItems: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
	},
	{ sequelize, tableName: 'event_packages', timestamps: true }
);

export default EventPackage;