require('dotenv').config();
const fs = require('fs');
const { Player } = require('discord-player');
const { Client, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// To load commands
const LOAD_SLASH = process.argv[2] == 'load';

// Env vars
const CLIENT_ID = process.env.CLIENT_ID;
const TOKEN = process.env.TOKEN;

// Instance Discord Client
const client = new Client({
  intents: ['GUILDS', 'GUILD_VOICE_STATES'],
});

// Addind slashcommands & player
// entities to { client } instance
client.slashcommands = new Collection();
client.player = new Player(client, {
  ytdlOptions: {
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
  },
});

// Create slash commands base by filenames
let commands = [];

const slashFiles = fs
  .readdirSync('./src/slash')
  .filter(file => file.endsWith('.js'));

for (const file of slashFiles) {
  const slashCommand = require(`./slash/${file}`);
  client.slashcommands.set(slashCommand.data.name, slashCommand);
  if (LOAD_SLASH) commands.push(slashCommand.data.toJSON());
}

// If 'load' the commands
if (LOAD_SLASH) {
  const rest = new REST({ version: '9' }).setToken(TOKEN);
  console.log('Adicionando os comandos...');
  rest
    .put(Routes.applicationCommands(CLIENT_ID), {
      body: commands,
    })
    .then(() => {
      console.log('Comandos adicionados com sucesso!');
      process.exit(0);
    })
    .catch(err => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
    });
} else {
  // Ready Server
  client.on('ready', () => {
    console.log(`Servidor: ${client.user.tag} rodando com sucesso!`);
  });

  // Server listening the commands
  client.on('interactionCreate', interaction => {
    async function handleCommand() {
      if (!interaction.isCommand()) return;

      const slashCommand = client.slashcommands.get(interaction.commandName);
      if (!slashCommand) await interaction.reply('Comando inválido.');

      await interaction.deferReply();
      await slashCommand.run({ client, interaction });
    }
    handleCommand();
  });
  client.login(TOKEN);
}
