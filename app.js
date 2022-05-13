import Discord, { Intents } from 'discord.js';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import dotenv from 'dotenv';
dotenv.config();

// Config
let timer;
let PRINTS = [];
const AUTO_SYNC = true; // Auto-sync print data [DURATION] minutes after last command
const BOT_ROLES = ['Admin', 'Mod']; // Change to restricted roles for manual bot updates
const SHEET_ID = '1-2JLV6aGzBb8_l4wQWom6TOrVyNTj2EgU5WrNyDdAT8';
const DURATION = 60;
const COMMANDS = `
# Print a list of all weekly winners
!print-list

# Print a list of the current weeks winners
!print-current

# Print a list of a specific weeks winners
!print-week <week-number>

# Check if a specific tokenID was selected in a previous giveaway
!print-check <tokenID>,<tokenID>,<tokenID>...
`;

/**
 * Gets print list data from remote Google Spreadsheet
 * @param { String } id - Google spreadsheet ID
 * @returns [array, array, number]
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

/**
 * Transform print data to deep array
 * ie. [[...], [...], [...]...]
 * @param {Function} cb
 */ 
const updatePrints = (cb) => {
  PRINTS = [];
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
    cb && cb();
    console.log('Print data synced...');
  });
};

/**
 * Creates a timer
 * @param {Number} time 
 * @returns 
 */
const Timer = (time) => {
  let _timer = null; 
  let _timerStarted = false;
  
  const _convertToMiliseconds = (min) => min * 60 * 1000;
  
  const _restart = () => {
    _cancel();
    _start();
  }
  
  const _cancel = () => {
    clearTimeout(_timer);
    _timerStarted = false;
  }
  
  const _start = () => {
    if (!_timerStarted){
      _timerStarted = true;
      _timer = setTimeout(() => {
        updatePrints();
        _cancel();
      }, _convertToMiliseconds(time));
    } else {
      _restart();
    }
  }
  
  return {
    start: _start
  };
};

// Initialize print data
updatePrints();

// Initialize Discord
const client = new Discord.Client({ 
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ],
  partials: [
    'MESSAGE'
  ]
});

// Login Discord
client.login(process.env.BOT_TOKEN);

// Discord API is ready
client.on('ready', () => {
  console.log('Bot is ready!');
  timer = Timer(DURATION);
});

/** 
 * Basic error handling for missing hyphen
 */
 client.on('messageCreate', (msg) => {
  if (msg.content.startsWith('!print ')) {
    msg.reply(`:robot: Beep boop! Please include a valid print command:\n${COMMANDS}`);
  }
  AUTO_SYNC && timer.start();
});

/** 
 * Display list of all print giveaway winners,
 * organized by week
 */
client.on('messageCreate', (msg) => {
  if (msg.content === '!print-list') {
    const content = `:robot: Beep boop! Here are the weekly print giveaway **winners** :tada:\n${PRINTS.map((week, i) => `\nWeek #${i+1}:\n\`\`\`fix\n${week.map(ae => `- ${ae}\n`)}\`\`\``)}`;
    msg.reply(content.replace(/\,/g, ''));
  }
  AUTO_SYNC && timer.start();
});

/** 
 * Display list of current weeks print giveaway winners
 */
 client.on('messageCreate', (msg) => {
  if (msg.content === '!print-current') {
    const content = `:robot: Beep boop! Here are the current weeks print giveaway **winners** :tada:\n\`\`\`fix\n${PRINTS[PRINTS.length - 1].map(ae => `- ${ae}\n`)}\`\`\``;
    msg.reply(content.replace(/\,/g, ''));
  }
  AUTO_SYNC && timer.start();
});

/** 
 * Display list of print giveaway winners for a given week
 */
client.on('messageCreate', (msg) => {
  if (msg.content.startsWith('!print-week')) {
    const week = Number(msg.content.replace(/\!print\-week\s/g, '')) || NaN;
    if (week && typeof week === 'number') {
      if (week <= PRINTS.length) {
        const content = `:robot: Beep boop! Here are the week #${week} print giveaway **winners** :tada:\n\`\`\`fix\n${PRINTS[week - 1].map(ae => `- ${ae}\n`)}\`\`\``;
        msg.reply(content.replace(/\,/g, ''));
      } else {
        msg.reply(`:robot: Beep boop! The last print week is #${PRINTS.length}, please select a previous week.`);
      }
    } else {
      msg.reply(':robot: Beep boop! Please include a valid week number with the command: !print-week <week-number>');
    }
  }
  AUTO_SYNC && timer.start();
});

/** 
 * Check if a tokenID has been selected in a previous giveaway
 */
client.on('messageCreate', (msg) => {
  if (msg.content.startsWith('!print-check')) {
    const tokenIDs = msg.content.replace(/\!print\-check\s/g, '').split(',').map((str) =>  Number(str.replace(/[^\w\s]/gi, '')) || NaN);

    if (tokenIDs.some(isNaN)) {
      msg.reply(':robot: Beep boop! Please include valid tokenIDs with the command: !print-check <tokenID>,<tokenID>,<tokenID>...');
    } else {
      const matches = [];
      const nonMatches = [];
      
      tokenIDs.forEach(tokenID => {
        let week = PRINTS.findIndex((week) => week.find(id => id === tokenID));
        if (week > -1){
          matches.push({
            week: week,
            id: tokenID
          });
        } else {
          nonMatches.push(tokenID);
        }
      });

      if (matches.length === 1 && nonMatches.length === 0) {
        msg.reply(`:robot: Beep boop! Token **#${matches[0].id}** was selected week #${matches[0].week + 1} as a print giveaway **winner** :tada:`);
      } 
      else if (matches.length === 0 && nonMatches.length === 1) {
        msg.reply(`:robot: Beep boop! Token #${nonMatches[0]} has not been selected yet for a weekly print giveaway.`);
      }
      else {
        const matchContent = (matches.length > 0) ? `Here are your print giveaway **winners** :tada:\n\`\`\`fix\n${matches.map(ae => `- ${ae.id}\n`)}\`\`\``.replace(/\,/g, '') : null;
        const nonMatchContent = (nonMatches.length > 0) ? `The following tokens have not been selected yet:\n\`\`\`${nonMatches.map(ae => `- ${ae}\n`)}\`\`\``.replace(/\,/g, '') : null;
        msg.reply(`:robot: Beep boop! ${matchContent ? matchContent + '\n' : ''}${nonMatchContent ? nonMatchContent : ''}`);
      }
    }
  }
  AUTO_SYNC && timer.start();
});

/** 
 * Sync print data (role-restricted)
 */
 client.on('messageCreate', (msg) => {
  if (msg.content === '!print-update') {
    if (msg.member.roles.cache.find(r => BOT_ROLES.includes(r.name))){
      msg.reply(`:robot: Beep boop! Fetching latest print data...`);
      updatePrints(() => {
        msg.reply(`:robot: Beep boop! Print data synced! :frame_photo:`);
      });
    } else {
      msg.reply(`:robot: Beep boop! Sorry, you do not have permission to run this command!`);
    }
  }
});