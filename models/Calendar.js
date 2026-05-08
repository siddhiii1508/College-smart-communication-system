const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Calendar = sequelize.define(
    "Calendar",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        event_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        event_type: {
            type: DataTypes.ENUM('Class', 'Holiday', 'Weekly Off'),
            defaultValue: 'Class'
        },
        branch: {
            type: DataTypes.STRING(50),
            defaultValue: 'All'
        },
        batch: {
            type: DataTypes.STRING(50),
            defaultValue: 'All'
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    },
    {
        tableName: "academic_calendar",
        timestamps: false
    }
);

module.exports = Calendar;
