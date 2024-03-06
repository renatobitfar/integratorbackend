
const Sequelize = require('sequelize');
const config = require('config');

const db = config.get('app.database');

const sequelize = new Sequelize(
    db.dbName,db.user,db.password,{dialect:'mysql',host:db.host});

module.exports = sequelize;