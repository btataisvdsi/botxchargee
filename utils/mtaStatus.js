const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Gamedig = require("gamedig");
const config = require("../config.json");

function getBrasiliaDate() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc - 3 * 60 * 60 * 1000);
}

async function getServerStatus() {
  try {
    const state = await Gamedig.query({
      type: "mtasa",
      host: config.mta.host,
      port: config.mta.port
    });

    // ✅ عدد اللاعبين بطريقة آمنة
    const numplayers = state.players?.length ?? state.raw?.numplayers ?? 0;
    const maxplayers = state.maxplayers ?? state.raw?.maxplayers ?? 0;

    const embed = new EmbedBuilder()
      .setColor('#ce921c')
      .setTitle('🎮 Nova Ordem RP CITY CONECT')
      .setDescription('Você pode conectar-se usando o botão abaixo ou verificar o status atualizado do servidor.')
      .addFields(
        { name: '``📶`` STATUS', value: '``+[🟢 Online]\n``', inline: true },
        { name: '``👥`` JOGADORES', value: `\`${numplayers}/${maxplayers}\``, inline: true },
        { name: '``🎯`` COPIE E COLE NO F8', value: `\`mtasa://${config.mta.host}:${config.mta.port}\``, inline: false },
        { name: '``⏱️`` PRÓXIMO RESTART', value: 'Em 1 minuto', inline: true },
        { name: '``🕘`` HORÁRIO', value: getBrasiliaDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), inline: true }
      )
      .setImage(config.images.status.banner)
      .setFooter({ text: '🔄 Conect • Nova Ordem RP CITY', iconURL: config.images.status.footer })
      .setTimestamp();

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('🔗 Conect')
        .setStyle(ButtonStyle.Link)
        .setURL('https://encurtador.com.br/zeaR')
    );

    return { embeds: [embed], components: [button] };
  } catch (err) {
    const embedOffline = new EmbedBuilder()
      .setColor('#ce921c')
      .setTitle('🎮 Nova Ordem RP CITY CONECT')
      .setDescription('Servidor está offline no momento.')
      .addFields(
        { name: '``📶`` STATUS', value: '``+[🔴 Offline]\n``', inline: true },
        { name: '``👥`` JOGADORES', value: '``0/0``', inline: true },
        { name: '``🎯`` COPIE E COLE NO F8', value: `\`mtasa://${config.mta.host}:${config.mta.port}\``, inline: false },
        { name: '``⏱️`` PRÓXIMO RESTART', value: 'Indisponível', inline: true },
        { name: '``🕘`` HORÁRIO', value: getBrasiliaDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), inline: true }
      )
      .setImage(config.images.status.banner)
      .setFooter({ text: '🔌 Servidor em Manutenção', iconURL: config.images.status.footer })
      .setTimestamp();

    const buttonOffline = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('🔗 Conect')
        .setStyle(ButtonStyle.Link)
        .setURL('https://encurtador.com.br/bfoQN')
    );

    return { embeds: [embedOffline], components: [buttonOffline] };
  }
}

module.exports = { getServerStatus };
