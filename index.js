require('dotenv').config();
const mysql = require('mysql');
const discord = require('discord.js');

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_SCHEMA
});
connection.connect();

const client = new discord.Client({
	// intents specify the actions the bot should be able to listen to and make
	intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES]
});

// Bot initialization
client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
	client.user.setActivity('Under development!');
});

// Run when a message is created in a channel the bot can access
client.on('messageCreate', async (message) => {
	if (message.content.toLowerCase() == 'hello') {
		message.channel.send('world');
	}
});

client.login(process.env.CLIENT_TOKEN);