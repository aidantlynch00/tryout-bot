require('dotenv').config();
const db = require('./db.js');
const discord = require('discord.js');

// set up Discord client
const client = new discord.Client({
	// intents specify the actions the bot should be able to listen to and make
	intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES, 
		discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS, discord.Intents.FLAGS.DIRECT_MESSAGES, 
		discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS]
});

let manChannel, regChannel, repChannel, genChannel;
let regMessage, regCollector;

const ranks = ['UNR', 'B1', 'B2', 'B3', 'S1', 'S2', 'S3',
			   'G1', 'G2', 'G3', 'P1', 'P2', 'P3', 'D1', 
			   'D2', 'D3', 'C1', 'C2', 'C3', 'GC1', 'GC2', 
			   'GC3', 'SSL'];

/**
* 
* @param {*} channel 
*/
async function clear(channel) {
	let fetched;
	do {
		fetched = await channel.messages.fetch({ limit: 99 });
		channel.bulkDelete(fetched);
	} while (fetched.size >= 2);
}

const dmFilter = (message) => message.author.id === user.id;
/**
 * 
 * @param {*} user 
 */
async function sendAccountForm(user) {
	let accountEmbed = new discord.MessageEmbed();
}

/**
 * 
 * @param {*} user 
 */
async function sendRankForm(user) {
	let rankEmbed = new discord.MessageEmbed()
		.setColor('#F76902')
		.setTitle('Rank')
		.setDescription(`Type your peak rank in 1s, 2s, or 3s last competitive season. Use the prefix that corresponds to your rank and a number 1 to 3 (unless you are SSL or unranked).
						 \nFollow the example below to properly enter your rank.`)
		.addFields(
			{ name: 'Unranked', value: 'UNR', inline: true },
			{ name: 'Bronze', value: 'B', inline: true },
			{ name: 'Silver', value: 'S', inline: true },
			{ name: 'Gold', value: 'G', inline: true },
			{ name: 'Platinum', value: 'P', inline: true },
			{ name: 'Diamond', value: 'D', inline: true },
			{ name: 'Champion', value: 'C', inline: true },
			{ name: 'Grand Champion', value: 'GC', inline: true },
			{ name: 'Supersonic Legend', value: 'SSL', inline: true },
			{ name: 'Example', value: 'Champion 3 \u2192 C3' }
		);

	let rankMessage = await user.send({ embeds: [rankEmbed] });

	
	let rankMessageCollector = rankMessage.channel.createMessageCollector({ dmFilter });
	rankMessageCollector.on('collect', (message) => {
		let input = message.content.toUpperCase();
		let rank = null;
		let mmr = 0;
		// make sure user input matches a rank
		for (let i = 0; i < ranks.length; i++) {
			if (input === ranks[i]) {
				rank = ranks[i];
				mmr = i * 75; // set linear MMR
			}
		}

		if (rank != null) { // update player's rank and MMR
			db.setRank(user, rank, mmr);
			rankMessageCollector.stop();
			sendAccountForm(user);
		}
		else { // error message
			message.channel.send('Please send a valid rank!');
		}
	});
}

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

// Run when a message is created in a channel the bot can access
client.on('messageCreate', async (message) => {
	
	// if message is in the management channel
	if (message.channel.id == manChannel.id) {

		// management starts a new tryout
		if (message.content.startsWith('!startreg')) {

			// custom embed for tryout description
			let embed = new discord.MessageEmbed()
				.setColor('#F76902')
				.setTitle('Tryout Registration')
				.setDescription(`React to this message to register for tryouts!\n
								 This bot will DM you to complete your registration.`);

			// delete all messages to registration channel
			clear(regChannel);

			// send embed to everyone
			regMessage = await regChannel.send({ content: '@everyone', embeds: [embed] });
			// set up reaction filter
			const filter = (reaction, user) => true;
			// create hook for reactions
			regCollector = regMessage.createReactionCollector({ filter });
			regCollector.on('collect', async (reaction) => {
				// get users on the reaction
				let userCollection = await reaction.users.fetch();
				userCollection.each(user => {
					// add user as player in DB
					db.addPlayer(user);

					// DM start of tryout form to user
					sendRankForm(user);
				});

				// remove all reactions
				regMessage.reactions.removeAll();
			});

		}
		
	}
});

client.login(process.env.CLIENT_TOKEN);