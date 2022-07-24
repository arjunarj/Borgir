const Discord = require('discord.js')
const DisTube = require('distube')
require('dotenv').config();
const commandHandler = require('./commands');

const client = new Discord.Client({
    intents: [
        'GUILDS',
        'GUILD_VOICE_STATES',
        'GUILD_MESSAGES',
    ],
  });

client.on('ready', client => {
    console.log(`Logged in as ${client.user.tag}!`);
})


client.on('messageCreate',commandHandler);

client.login(process.env.TOKEN);