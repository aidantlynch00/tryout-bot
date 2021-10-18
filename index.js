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
	intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES, 
		discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS, discord.Intents.FLAGS.DIRECT_MESSAGES, 
		discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS]
});

let manChannel, regChannel, repChannel, genChannel;

// Bot initialization
client.once('ready', async () => {
	console.log(`Logged in as ${client.user.tag}`);
	client.user.setActivity('Under development!');

	// get channels this bot uses
	manChannel = await client.channels.fetch(process.env.MAN_CHANNEL);
	regChannel = await client.channels.fetch(process.env.REG_CHANNEL);
	repChannel = await client.channels.fetch(process.env.REP_CHANNEL);
	genChannel = await client.channels.fetch(process.env.GEN_CHANNEL);
});

async function clear(channel) {
	let fetched;
	do {
		fetched = await channel.messages.fetch({ limit: 99 });
		channel.bulkDelete(fetched);
	} while (fetched.size >= 2);
}

let regMessage, collector;
// Run when a message is created in a channel the bot can access
client.on('messageCreate', async (message) => {
	
	// if message is in the management channel
	if (message.channel.id == manChannel.id) {
		// management starts a new tryout
		if (message.content.startsWith('!start')) {
			// custom embed for tryout description
			let embed = new discord.MessageEmbed()
				.setColor('#F76902')
				.setTitle('Tryout Registration')
				.setDescription('React to this message to register for tryouts!');

			// delete all messages to registration channel
			clear(regChannel);

			// send embed to everyone
			regMessage = await regChannel.send({ content: '@everyone', embeds: [embed] });
			// set up reaction filter
			const filter = (reaction, user) => true;
			// create hook for reactions
			collector = regMessage.createReactionCollector({ filter });
			collector.on('collect', async (reaction) => {
				// get users on the reaction
				let userCollection = await reaction.users.fetch();
				userCollection.each(user => {
					// add user as player in DB
					connection.query(`INSERT IGNORE INTO players (discord_id) VALUES (${user.id})`);
				});

				// remove all reactions
				regMessage.reactions.removeAll();
			});
		}
	}
});

client.login(process.env.CLIENT_TOKEN);