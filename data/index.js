const Sequelize = require('sequelize');
const config = require('../config.json');

const options = {
    host: config.host,
    dialect: config.dialect,
    logging: false,
    port: config.port,
};
const sequelize = new Sequelize(config.database, config.login, config.password, options);

const Repo = require('./repo')(Sequelize, sequelize);
const Commit = require('./commit')(Sequelize, sequelize);

Commit.belongsTo(Repo, { foreignKey: 'repoId', onDelete: 'cascade' });

const context = {
    repos: Repo,
    commits: Commit,

    Sequelize,
    sequelize,
};

module.exports = context;