import Discord, { Intents } from 'discord.js';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import dotenv from 'dotenv';
dotenv.config();

// config
const PRINTS = [];
const SHEET_ID = '1-2JLV6aGzBb8_l4wQWom6TOrVyNTj2EgU5WrNyDdAT8';

/**
 * Gets print list data from remote Google Spreadsheet
 * @param { String } id - Google spreadsheet ID
 * @returns 
 */
const getPrintData = async (id) => {
  if (!id) return;
  
  const doc = new GoogleSpreadsheet(id);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  });
  
  await doc.loadInfo();
  
  const sheet = doc.sheetsByIndex[0];
  await sheet.loadCells('A1:Z100');
  
  const columns = sheet.columnCount;
  const rows = await sheet.getRows();
  
  return [sheet, columns, rows.length];
};

// Transform print data to deep array
getPrintData(SHEET_ID)
.then(([sheet, columns, rows]) => {
  for (let i = 0; i < columns; i++) {
    if (sheet.getCell(0, i).value){
      PRINTS[i] = [];
      for (let j = 0; j <= rows; j++) {
        if (sheet.getCell(j + 1, i).value){
          PRINTS[i].push(sheet.getCell(j + 1, i).value);
        }
      }
      if (PRINTS[i].length === 0) {
        PRINTS.pop();
      }
    }
  }
});

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
    const content = `🤖 Beep boop! Here are the weekly print giveaway winners:\n${PRINTS.map((week, i) => `\nWeek #${i+1}:\n${week.map(ae => `- ${ae}\n`)}`)}`;
    msg.reply(content.replace(/\,/g, ''));
  }
});

/** 
 * Display list of current weeks print giveaway winners
 */
 client.on('messageCreate', (msg) => {
  if (msg.content === '!print-current') {
    const content = `🤖 Beep boop! Here are the current weeks print giveaway winners:\n${PRINTS[PRINTS.length - 1].map(ae => `- ${ae}\n`)}`;
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
      if (week <= PRINTS.length) {
        const content = `🤖 Beep boop! Here are the print giveaway winners for week #${week}:\n${PRINTS[week - 1].map(ae => `- ${ae}\n`)}`;
        msg.reply(content.replace(/\,/g, ''));
      } else {
        msg.reply(`🤖 Beep boop! The last print week is #${PRINTS.length}, please select a previous week.`);
      }
    } else {
      msg.reply('🤖 Beep boop! Please include a valid week number with the command: !print-week <week-number>');
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
      let foundWeek = PRINTS.find((week, weekIndex) => {
        if (week){
          const foundID = week.find(id => id === tokenID);
          if (foundID) {
            msg.reply(`🤖 Beep boop! Token #${foundID} was already selected week #${weekIndex + 1} for a print giveaway.`);
          }
          return foundID === tokenID;
        } else {
          return false;
        }
      })
      if (!foundWeek) {
        msg.reply(`🤖 Beep boop! Token #${tokenID} has not been selected yet for weekly print giveaway.`);
      }
    } else {
      msg.reply('🤖 Beep boop! Please include a valid tokenID with the command: !print-check <tokenID>');
    }
  }
});