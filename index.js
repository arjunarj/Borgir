const Discord = require('discord.js')
const { DisTube } = require('distube')
const { SpotifyPlugin } = require('@distube/spotify');
const keepAlive = require('./server');
require('dotenv').config();

keepAlive();

const client = new Discord.Client({
    intents: [
        'GUILDS',
        'GUILD_VOICE_STATES',
        'GUILD_MESSAGES',
    ],
  });

  const distube = new DisTube (client, {
    searchSongs: 5,
    searchCooldown: 30,
    leaveOnEmpty: true,
	leaveOnFinish: false,
	leaveOnStop: false,
    plugins: [new SpotifyPlugin({
        parallel: true,
        emitEventsAfterFetching: false,
        api: {
            clientId: `${process.env.SPOTIFY_ID}`,
            clientSecret: `${process.env.SPOTIFY_TOKEN}`,
        },
    })],
})

  
const prefix = '.'; 
client.on('ready', client => {
    console.log(`Logged in as ${client.user.tag}!`);
})

client.on('messageCreate', message => {
	//if (message.author.bot || !message.inGuild()) return;
	if (!message.content.startsWith(prefix)) return;
	const args = message.content
		.slice(prefix.length)
		.trim()
		.split(/ +/g);
	const command = args.shift();

    if (command == 'hi'){
        message.channel.send('bruh')
    }

	if (command === 'play' || command ==='p' || command==='..') {
		const voiceChannel = message.member?.voice?.channel;
		if (voiceChannel) {
			distube.play(voiceChannel, args.join(' '), {
				message,
				textChannel: message.channel,
				member: message.member,
			});
		} else {
			message.channel.send(
				'You must join a voice channel first.',
			);
		}
	}

	if (['repeat', 'loop'].includes(command)) {
		const mode = distube.setRepeatMode(message);
		message.channel.send(
			`Set repeat mode to \`${
				mode
					? mode === 2
						? 'All Queue'
						: 'This Song'
					: 'Off'
			}\``,
		);
	}

	if (command === 'stop') {
		distube.stop(message);
		message.channel.send('Stopped the music!');
	}

	if (command === 'leave') {
		distube.voices.get(message)?.leave();
		message.channel.send('Leaved the voice channel!');
	}

	if (command === 'resume') {
		distube.resume(message)
		message.channel.send("Playing ▶️")
	};

	if (command === 'pause') {
		distube.pause(message)
		message.channel.send("Paused ⏸️")
	};

	if (command === 'skip' || command === 's') {
		distube.skip(message)
		message.channel.send("Skipped ⏭️")
	};
	if (command === 'shuffle') {
		distube.shuffle(message)
		message.channel.send("Shuffled 🔀")
	};

	if (command === 'queue' || command === 'q') {
		const queue = distube.getQueue(message);
		if (!queue) {
			message.channel.send('Nothing playing right now!');
		} else {
			message.channel.send(
				`Current queue:\n${queue.songs
					.map(
						(song, id) =>
							`**${id ? id : 'Playing'}**. ${
								song.name
							} - \`${song.formattedDuration}\``,
					)
					.slice(0, 10)
					.join('\n')}`,
			);
		}
	}

	if (
		[
			'3d',
			'bassboost',
			'echo',
			'karaoke',
			'nightcore',
			'vaporwave',
		].includes(command)
	) {
		const filter = distube.setFilter(message, command);
		message.channel.send(
			`Current queue filter: ${filter.join(', ') || 'Off'}`,
		);
	}
});

// Queue status template
const status = queue =>
	`Volume: \`${queue.volume}%\` | Loop: \`${
		queue.repeatMode
			? queue.repeatMode === 2
				? 'All Queue'
				: 'This Song'
			: 'Off'
	}\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``;

// DisTube event listeners, more in the documentation page
distube
	// .on('playSong', (queue, song) =>
	// 	queue.textChannel?.send(
	// 		`Playing \`${song.name}\` - \`${
	// 			song.formattedDuration
	// 		}\`\nRequested by: ${song.user}\n${status(queue)}`,
	// 	),
	// )
	.on('addSong', (queue, song) =>
		queue.textChannel?.send(
			`Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`,
		),
	)
	.on('addList', (queue, playlist) =>
		queue.textChannel?.send(
			`Added \`${playlist.name}\` playlist (${
				playlist.songs.length
			} songs) to queue\n${status(queue)}`,
		),
	)
	.on('error', (textChannel, e) => {
		console.error(e);
		textChannel.send(
			`An error encountered: ${e.message.slice(0, 2000)}`,
		);
	})
	// .on('finish', queue => queue.textChannel?.send('Finish queue!'))
	// .on('finishSong', queue =>
	// 	queue.textChannel?.send('Finish song!'),
	// )
	// .on('disconnect', queue =>
	// 	queue.textChannel?.send('Disconnected!'),
	// )
	.on('empty', queue =>
		queue.textChannel?.send(
			'The voice channel is empty! Leaving the voice channel...',
		),
	)
	// DisTubeOptions.searchSongs > 1
	.on('searchResult', (message, result) => {
		let i = 0;
		message.channel.send(
			`**Choose an option from below**\n${result
				.map(
					song =>
						`**${++i}**. ${song.name} - \`${
							song.formattedDuration
						}\``,
				)
				.join(
					'\n',
				)}\n*Enter anything else or wait 30 seconds to cancel*`,
		);
	})
	.on('searchCancel', message =>
		message.channel.send('Searching canceled'),
	)
	.on('searchInvalidAnswer', message =>
		message.channel.send('Invalid number of result.'),
	)
	.on('searchNoResult', message =>
		message.channel.send('No result found!'),
	)
	.on('searchDone', () => {});


client.login(process.env.TOKEN);