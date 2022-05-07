# ae discord print bot

## Install bot on Discord
https://discord.com/api/oauth2/authorize?client_id=964807472382623764&permissions=0&scope=bot

## Spreadsheet for managing IDs
https://docs.google.com/spreadsheets/d/1-2JLV6aGzBb8_l4wQWom6TOrVyNTj2EgU5WrNyDdAT8/edit#gid=0

## Commands
```
# Print a list of all weekly winners
!print-list

# Print a list of the current weeks winners
!print-current

# Print a list of a specific weeks winners
!print-week <week-number>

# Check if a specific tokenID was selected in a previous giveaway
!print-check <tokenID>,<tokenID>,<tokenID>...
```

## Developer Setup

### Prerequisites
At a minimum, you will need:
- [Node](https://github.com/nvm-sh/nvm#installing-and-updating)
- [Yarn](https://classic.yarnpkg.com/en/docs/install#mac-stable)

Once Node and Yarn are setup, install the project using the following command.
```
$ git clone git@github.com:micjamking/ae-discord-bot.git
...
$ cd ae-discord-bot
$ yarn install
```

### Running the development server
Note: You'll need to complete the Discord app & Google Cloud project setup
```
$ npm start
```

## Discord app & Google Cloud project setup

### Create discord bot application
1. To register the bot, visit [Discord’s developer portal](https://discord.com/developers/applications).
2. Click on the “New Application” link in the top-right corner
3. Give your application a name, and click the “Create” button
4. On the right side is an option labeled “Bot”. Click it, and select “Add Bot”.
5. Change the name of the bot, and click the "Save" button.
6. Copy the token received from this page (ie. `<discord-bot-token>`).

### Set up your google project & enable the sheets API 👈
1. Go to the Google Developers Console
2. Select your project or create a new one (and then select it)
3. Enable the Sheets API for your project
  - In the sidebar on the left, select APIs & Services > Library
  - Search for "sheets"
  - Click on "Google Sheets API"
  - Click the blue "Enable" button

### Create service account
1. Follow steps above to set up project and enable sheets API
2. Create a service account for your project
  - In the sidebar on the left, select APIs & Services > Credentials
  - Click blue "+ CREATE CREDENTIALS" and select "Service account" option
  - Enter name, description, click "CREATE"
  - You can skip permissions, click "CONTINUE"
  - Click "+ CREATE KEY" button
  - Select the "JSON" key type option
  - Click "Create" button
  - Your JSON key file is generated and downloaded to your machine (it is the only copy!)
  - Click "DONE"
  - Note your service account's email address (also available in the JSON key file (ie. `<service-account-email-address>` and `<service-account-private-key>`))
3. Share the doc (or docs) with your service account using the email noted above

### Create environment variables for credentials
1. Create a `.env` file in the root of the project
2. Add the following values to the file from the JSON key file
```
BOT_TOKEN=<discord-bot-token>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<service-account-email-address>
GOOGLE_PRIVATE_KEY=<service-account-private-key>
```