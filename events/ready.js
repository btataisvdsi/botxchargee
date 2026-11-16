const { ActivityType } = require("discord.js");
const { getServerStatus } = require("../utils/mtaStatus");
const config = require("../config.json");

module.exports = {
  name: "clientReady",
  once: true,
  async execute(client) {
    console.log(`📡 Evento 'ready' disparado!`);
    console.log(`✅ Bot está online como ${client.user.tag}`);

    const statusList = [
      { name: "Vem pro Nova Ordem RP CITY!", type: ActivityType.Listening },
      { name: "Nova Ordem RP CITY", type: ActivityType.Playing },
      { name: "Discord/Nova Ordem RP CITY", type: ActivityType.Watching },
      { name: "O melhor do MTA", type: ActivityType.Competing },
    ];
    let index = 0;

    // 🔹 Alterna o status do bot a cada 1 minuto
    setInterval(() => {
      const status = statusList[index];
      client.user.setActivity(status.name, { type: status.type });
      index = (index + 1) % statusList.length;
    }, 60000);

    // 🔹 Busca o canal de status
    try {
      const channel = await client.channels.fetch(config.canais.geral.statusCity);
      if (!channel) {
        console.error("❌ Canal de status MTA não encontrado! (Verifique o ID no config.json)");
        return;
      }

      // 🔹 Envia a primeira mensagem de status
      const messageContent = await getServerStatus();
      const message = await channel.send(messageContent);

      // 🔹 Atualiza a cada 1 minuto
      setInterval(async () => {
        try {
          const updatedContent = await getServerStatus();
          await message.edit(updatedContent);
        } catch (err) {
          console.error("❌ Erro ao atualizar o status MTA:", err);
        }
      }, 60000);
    } catch (err) {
      console.error("❌ Erro ao buscar o canal de status:", err);
    }
  },
};
