const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Notice = sequelize.define(
    "Notice",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        file_name: {
            type: DataTypes.STRING
        },
        department_id: {
            type: DataTypes.INTEGER
        },
        category: {
            type: DataTypes.ENUM('Examination', 'Academic', 'Events', 'Placement', 'General', 'Syllabus', 'Academic Calendar'),
            defaultValue: 'General'
        },
        target_branch: {
            type: DataTypes.STRING(50),
            defaultValue: 'All'
        },
        target_batch: {
            type: DataTypes.STRING(10),
            defaultValue: 'All'
        },
        expiry_date: {
            type: DataTypes.DATEONLY,   // DATE only, no time
            allowNull: true,
            defaultValue: null
        },
        created_at: {
            type: DataTypes.DATE,
            field: 'created_at'
        }
    },
    {
        tableName: "notices",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    }
);

module.exports = Notice;
