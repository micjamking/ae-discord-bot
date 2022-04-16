import Discord, { Intents } from 'discord.js';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import dotenv from 'dotenv';
dotenv.config();

// Initialize the sheet
const doc = new GoogleSpreadsheet('1-2JLV6aGzBb8_l4wQWom6TOrVyNTj2EgU5WrNyDdAT8');

await doc.useServiceAccountAuth({
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
});

await doc.loadInfo();
const sheet = doc.sheetsByIndex[0];
await sheet.loadCells('A1:Z100');

const prints = [];

for (let i = 0; i < 26; i++) {
  prints[i] = [];
  for (let j = 0; j <= 10; j++) {
    if (sheet.getCell(j + 1, i).value){
      prints[i].push(sheet.getCell(j + 1, i).value);
    }
  }
  if (prints[i].length === 0) {
    prints.splice(-1);
  }
}

// Initialize discord
const client = new Discord.Client({ 
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ],
  partials: [
    'MESSAGE'
  ]
});

// Login
client.login(process.env.BOT_TOKEN);

// API is ready
client.on('ready', () => {
  console.log('Bot is ready');
});

/** 
 * Display list of all print giveaway winners,
 * organized by week
 */
client.on('messageCreate', (msg) => {
  if (msg.content === '!print-list') {
    const content = `Weekly print giveaway winners:\n${prints.map((week, i) => `\nWeek #${i+1}:\n${week.map(ae => `- ${ae}\n`)}`)}`;
    msg.reply(content.replace(/\,/g, ''));
  }
});

/** 
 * Display list of print giveaway winners for a given week
 */
client.on('messageCreate', (msg) => {
  if (msg.content.startsWith('!print-week')) {
    const week = Number(msg.content.replace(/\!print\-week\s/g, '')) || null;
    if (week && typeof week === 'number') {
      if (week <= prints.length) {
        const content = `Here are the print giveaway winners for week #${week}:\n${prints[week - 1].map(ae => `- ${ae}\n`)}`;
        msg.reply(content.replace(/\,/g, ''));
      } else {
        msg.reply(`The last print week is #${prints.length}, please select a previous week.`);
      }
    } else {
      msg.reply('Please include a valid week number with the command: !print-week <week-number>');
    }
  }
});

/** 
 * Check if a tokenID has been selected in a previous giveaway
 */
client.on('messageCreate', (msg) => {
  if (msg.content.startsWith('!print-check')) {
    const tokenID = Number(msg.content.replace(/\!print\-check\s/g, '')) || null;
    
    if (tokenID && typeof tokenID === 'number') {
      let foundWeek = prints.find((week, weekIndex) => {
        if (week){
          const foundID = week.find(id => id === tokenID);
          if (foundID) {
            msg.reply(`Token #${foundID} was already selected week #${weekIndex + 1} for a print giveaway.`);
          }
          return foundID === tokenID;
        } else {
          return false;
        }
      })
      if (!foundWeek) {
        msg.reply(`Token has not been selected yet for weekly print giveaway.`);
      }
    } else {
      msg.reply('Please include a valid tokenID with the command: !print-check <tokenID>');
    }
  }
});