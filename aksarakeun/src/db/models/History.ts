import { DataTypes, Model, Optional } from "sequelize";
import connection from "../../config/dbConnect";
import User from "./User";

interface HistoryAttributes {
    id?: number;
    user_id: number;
    image: string;
    result: string;
    createdAt: Date;
}

class History extends Model<HistoryAttributes> implements HistoryAttributes {
    public id!: number;
    public user_id!: number;
    public image!: string;
    public result!: string;
    public createdAt!: Date;

    // Define associations
    public static associate() {
        History.belongsTo(User, { foreignKey: "user_id" });
    }
}

History.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        result: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize: connection,
        modelName: "History",
        tableName: "History", // Specify the table name if it differs from the model name
        timestamps: false, // Set timestamps to false if you don't want to include 'updatedAt' column
    }
);

export default History;
