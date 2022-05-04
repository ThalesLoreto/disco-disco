const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Randomiza a fila de músicas'),

  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);
    if (!queue || !queue.playing) {
      return await interaction.editReply('Não há músicas na fila.');
    }

    queue.shuffle();
    await interaction.editReply('A fila ficou baguncada :S');
  },
};
