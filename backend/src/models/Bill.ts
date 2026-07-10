import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Quotation from './Quotation';
import Client from './Client';

class Bill extends Model {
	public id!: string;
	public quotationId!: string;
	public clientId!: string;
	public amount!: number;
	public status!: 'unpaid' | 'partial' | 'paid';
	public createdAt!: Date;
	public updatedAt!: Date;
}

Bill.init(
	{
		id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
		quotationId: { type: DataTypes.UUID, allowNull: false, unique: true },
		clientId: { type: DataTypes.UUID, allowNull: false },
		amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
		status: {
			type: DataTypes.ENUM('unpaid', 'partial', 'paid'),
			allowNull: false,
			defaultValue: 'unpaid',
		},
	},
	{ sequelize, tableName: 'bills', timestamps: true }
);

Bill.belongsTo(Quotation, { foreignKey: 'quotationId' });
Bill.belongsTo(Client, { foreignKey: 'clientId' });

export default Bill;