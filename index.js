require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const config = require("./config.json");

const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
  console.error("❌ DISCORD_TOKEN غير موجود! حطو فـ .env أو فـ Environment Variables.");
  process.exit(1);
}

// === Inicialização do cliente Discord ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

client.commands = new Collection();

// === Carregar comandos ===
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    console.log(`✅ Comando carregado: ${command.data.name}`);
  } else {
    console.warn(`⚠️ Comando "${file}" está faltando "data" ou "execute".`);
  }
}

// === Carregar eventos ===
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
  console.log(`✅ Evento carregado: ${event.name}`);
}

// === Eventos de erro global ===
process.on('unhandledRejection', (error) => {
  console.error('⚠️ Erro não tratado:', error);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Erro crítico:', error);
});

// === Login do bot ===
client.login(TOKEN);