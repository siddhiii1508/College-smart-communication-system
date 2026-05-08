const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM("admin", "student"),
        defaultValue: "student"
    },
    branch: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    semester: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    batch_start: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    batch_end: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    profile_pic: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: "users",
    timestamps: false
});

module.exports = User;



//const { DataTypes } = require("sequelize");
//const sequelize = require("../config/db");

//const User = sequelize.define("User", {
   // name: { type: DataTypes.STRING, allowNull: false },
   // email: { type: DataTypes.STRING, unique: true, allowNull: false },
   // password: { type: DataTypes.STRING, allowNull: false },
   // role: { type: DataTypes.STRING, defaultValue: "student" } // employee / manager
//});

//module.exports = User;