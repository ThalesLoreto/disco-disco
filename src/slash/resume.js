const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Volta com a música'),
  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);

    if (!queue) return await interaction.editReply('Não há músicas na fila.');

    queue.setPaused(false);
    await interaction.editReply(
      'Música voltou! Escreva `/pause` caso queira pausar a música =)',
    );
  },
};
