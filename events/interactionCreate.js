const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const config = require("../config.json");

const SUPPORT_ROLE_ID = config.cargos.suporte;
const TICKET_CATEGORY_ID = config.categorias.ticket;

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {

    // ========================== SLASH COMMANDS ==========================
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        const msg = { content: "❌ Ocorreu um erro ao executar este comando.", flags: 64 };
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp(msg).catch(() => null);
        } else {
          await interaction.reply(msg).catch(() => null);
        }
      }
    }

    // ========================== AUTOCOMPLETE ==========================
    if (interaction.isAutocomplete()) {
      try {
        const command = client.commands.get(interaction.commandName);
        if (!command || !command.autocomplete) return interaction.respond([]);
        await command.autocomplete(interaction, client);
      } catch (err) {
        console.error(`Erro no autocomplete (${interaction.commandName}):`, err);
        await interaction.respond([]).catch(() => null);
      }
    }

    // ========================== SELECT MENU (TICKET) ==========================
    if (interaction.isStringSelectMenu() && interaction.customId === "criar_ticket_select") {
      const selected = interaction.values[0];

      // ✅ اسم القناة آمن
      const safeUser = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
      const ticketName = `ticket-${selected}-${safeUser}`.slice(0, 100);

      const existing = interaction.guild.channels.cache.find(
        c => c.name === ticketName && c.parentId === TICKET_CATEGORY_ID
      );
      if (existing) {
        return interaction.reply({ content: "❗ Você já tem um ticket aberto.", flags: 64 });
      }

      await interaction.deferReply({ flags: 64 });

      try {
        const channel = await interaction.guild.channels.create({
          name: ticketName,
          type: 0,
          parent: TICKET_CATEGORY_ID,
          permissionOverwrites: [
            { id: interaction.guild.id, deny: ["ViewChannel"] },
            { id: interaction.user.id, allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"] },
            { id: SUPPORT_ROLE_ID, allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"] }
          ]
        });

        const embed = new EmbedBuilder()
          .setColor(0x2f3136)
          .setTitle("📥 Bem-vindo(a) ao Chat de Atendimento!")
          .setDescription(
            `Por favor, aguarde até que algum <@&${SUPPORT_ROLE_ID}> assuma o seu atendimento.\n` +
            `Seja claro(a) na descrição do seu problema para um atendimento eficiente.\n\n` +
            `⚡ **Status:**\n🟠 Aguardando...\n\nAgradecemos a sua compreensão e colaboração!`
          )
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

        const rowBotoes = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("finalizar_atendimento")
            .setLabel("✅ Finalizar Atendimento")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("cancelar")
            .setLabel("❌ Sair ou Cancelar")
            .setStyle(ButtonStyle.Danger)
        );

        await channel.send({
          content: `<@${interaction.user.id}> <@&${SUPPORT_ROLE_ID}>`,
          embeds: [embed],
          components: [rowBotoes]
        });

        await interaction.editReply({ content: `✅ Ticket criado: ${channel}` });
      } catch (err) {
        console.error("Erro ao criar ticket:", err);
        await interaction.editReply({ content: "❌ Erro ao criar o ticket. Verifique as permissões do bot." });
      }
    }

    // ========================== BOTÕES ==========================
    if (interaction.isButton()) {
      if (interaction.customId === "cancelar" || interaction.customId === "finalizar_atendimento") {
        const isSupport = interaction.member.roles.cache.has(SUPPORT_ROLE_ID);
        if (interaction.customId === "finalizar_atendimento" && !isSupport) {
          return interaction.reply({ content: "❌ Você não tem permissão para finalizar o atendimento.", flags: 64 });
        }

        await interaction.reply({ content: "✅ Este ticket será encerrado em 5 segundos.", flags: 64 });
        setTimeout(() => interaction.channel.delete().catch(() => null), 5000);
      }
    }
  }
};
