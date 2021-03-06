'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(__filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config.json')[env];
var db        = {};

let password = process.env.PASSWORD || config.password;
let sequelize = new Sequelize(config.database, config.username, password, config);

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

sequelize
  .authenticate()
  .then(function(err) {
    console.log('===> SARDCOIN BACK-END loaded successfully.');
  })
  .catch(function (err) {
    console.log('===> ERROR: unable to connect to the database.', err);
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
