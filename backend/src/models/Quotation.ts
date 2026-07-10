import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Client from './Client';

export interface LineItem {
	label: string;
	qty: number;
	rate: number;
	amount: number;
}

export type DiscountType = 'flat' | 'percent';
export type GstType = 'cgst_sgst' | 'igst';
export type QuotationStatus = 'draft' | 'final' | 'converted';

class Quotation extends Model {
	public id!: string;
	public clientId!: string;
	public lineItems!: LineItem[];
	public discountType!: DiscountType;
	public discountValue!: number;
	public gstType!: GstType;
	public taxRate!: number;
	public subtotal!: number;
	public taxAmount!: number;
	public total!: number;
	public status!: QuotationStatus;
	public createdAt!: Date;
	public updatedAt!: Date;
}

Quotation.init(
	{
		id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
		clientId: { type: DataTypes.UUID, allowNull: false },
		lineItems: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
		discountType: { type: DataTypes.ENUM('flat', 'percent'), allowNull: false, defaultValue: 'flat' },
		discountValue: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
		gstType: { type: DataTypes.ENUM('cgst_sgst', 'igst'), allowNull: false, defaultValue: 'cgst_sgst' },
		taxRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
		subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
		taxAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
		total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
		status: {
			type: DataTypes.ENUM('draft', 'final', 'converted'),
			allowNull: false,
			defaultValue: 'draft',
		},
	},
	{ sequelize, tableName: 'quotations', timestamps: true }
);

Quotation.belongsTo(Client, { foreignKey: 'clientId' });
Client.hasMany(Quotation, { foreignKey: 'clientId' });

export default Quotation;