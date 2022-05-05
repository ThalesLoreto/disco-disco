const { MessageEmbed } = require('discord.js');
const { QueryType } = require('discord-player');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Busca músicas no YouTube')
    .addSubcommand(subcommand =>
      subcommand
        .setName('search')
        .setDescription('Procura sua música')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Nome da música')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('song')
        .setDescription('Carrega uma música pela URL')
        .addStringOption(option =>
          option
            .setName('url')
            .setDescription('URL da música')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('playlist')
        .setDescription('Carrega uma playlist pela URL')
        .addStringOption(option =>
          option
            .setName('url')
            .setDescription('URL da playlist')
            .setRequired(true),
        ),
    ),
  run: async ({ client, interaction }) => {
    if (!interaction.member.voice.channel)
      await interaction.editReply('Você precisa estar em um chat de voz.');

    const queue = await client.player.createQueue(interaction.guild);
    if (!queue.connection)
      await queue.connect(interaction.member.voice.channel);

    let embed = new MessageEmbed();

    if (interaction.options.getSubcommand() === 'search') {
      let url = interaction.options.getString('name');
      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      });
      if (result.tracks.length === 0)
        return await interaction.editReply('Sem resultados..');

      const song = result.tracks[0];
      await queue.addTrack(song);
      embed
        .setDescription(`${song.title} foi adicionado a fila`)
        .setThumbnail(song.thumbnail)
        .setFooter({ text: `Duracao: ${song.duration}` });
    } else if (interaction.options.getSubcommand() === 'song') {
      let url = interaction.options.getString('url');
      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_VIDEO,
      });
      if (result.tracks.length === 0)
        return await interaction.editReply('Sem resultados..');

      const song = result.tracks[0];
      await queue.addTrack(song);
      embed
        .setDescription(`${song.title} foi adicionado a fila`)
        .setThumbnail(song.thumbnail)
        .setFooter({ text: `Duracao: ${song.duration}` });
    } else if (interaction.options.getSubcommand() === 'playlist') {
      let url = interaction.options.getString('url');
      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_PLAYLIST,
      });
      if (result.tracks.length === 0)
        return await interaction.editReply('Sem resultados..');

      const playlist = result.playlist;
      await queue.addTracks(result.tracks);
      embed
        .setDescription(
          `${result.tracks.length} músicas de ${playlist.title} [${playlist.url}] foram adicionadas a fila`,
        )
        .setThumbnail(playlist.thumbnail);
    }
    if (!queue.playing) await queue.play();
    await interaction.editReply({
      embeds: [embed],
    });
  },
};
