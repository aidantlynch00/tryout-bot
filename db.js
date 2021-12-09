const mysql = require('mysql');

// connect to MySQL
const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_SCHEMA
});
connection.connect();

exports.addPlayer = function (user) {
	connection.query(`INSERT IGNORE INTO players (discord_id) VALUES (${user.id})`);
}

exports.setRank = function (user, rank, mmr) {
	connection.query(`UPDATE players SET players.rank = '${rank}', players.mmr = ${mmr} WHERE discord_id = ${user.id}`);
}

exports.addPlayerAccountID = function (user, type, id) {

}