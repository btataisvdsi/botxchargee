const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require("discord.js");
const config = require("../config.json");

const ADMIN_ROLE_ID = config.cargos.admin;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Envia o painel de ticket."),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
      return interaction.reply({ content: "❌ Sem permissão.", flags: 64 });
    }

    await interaction.deferReply({ flags: 64 });

    const embed = new EmbedBuilder()
      .setColor(0xce921c)
      .setTitle("🎫 Atendimento - Nova Ordem RP City")
      .setThumbnail(config.images.ticket.thumbnail)
      .setDescription(
        "Olá! 👋 Seja bem-vindo ao nosso painel de atendimento.\n\n" +
        "Para receber suporte, selecione uma das categorias no menu abaixo.\n" +
        "Nossa equipe está pronta para te ajudar de forma rápida e eficiente.\n\n" +
        "**📌 Dicas para um bom atendimento:**\n" +
        "• Seja claro e direto em sua solicitação\n" +
        "• Escolha a categoria correta para agilizar o processo\n\n" +
        "**🕒 Horário de Atendimento:**\n" +
        "Segunda a Sexta — das 12:00 AM às 10:00 PM"
      )
      .setImage(config.images.ticket.banner)
      .setFooter({
        text: "Atendimento Nova Ordem RP City",
        iconURL: config.images.ticket.footer
      });

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("criar_ticket_select")
        .setPlaceholder("Atendimento Nova Ordem RP City")
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel("Mods")
            .setDescription("Solicitações e dúvidas sobre modificações")
            .setEmoji("🛡️")
            .setValue("mods"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Financeiro")
            .setDescription("Assuntos relacionados a pagamentos e finanças")
            .setEmoji("💰")
            .setValue("financeiro"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Organizações")
            .setDescription("Dúvidas sobre organizações e empresas")
            .setEmoji("🏢")
            .setValue("organizacoes"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Contas")
            .setDescription("Problemas com contas e acesso")
            .setEmoji("👤")
            .setValue("contas")
        )
    );

    await interaction.editReply({ content: "✅ Painel de ticket enviado!" });
    await interaction.channel.send({ embeds: [embed], components: [row] });
  }
};
