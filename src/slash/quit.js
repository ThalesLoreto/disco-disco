const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quit')
    .setDescription('Remove todas as músicas da fila e para o Bot'),

  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);
    if (!queue || !queue.playing) {
      return await interaction.editReply('Não há músicas na fila.');
    }

    queue.destroy();
    await interaction.editReply('Saindo!');
  },
};
