# ae discord print bot

## Install bot on Discord
https://discord.com/api/oauth2/authorize?client_id=964807472382623764&permissions=0&scope=bot

## Spreadsheet for managing IDs
https://docs.google.com/spreadsheets/d/1-2JLV6aGzBb8_l4wQWom6TOrVyNTj2EgU5WrNyDdAT8/edit#gid=0

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
  - Note your service account's email address (also available in the JSON key file)
3. Share the doc (or docs) with your service account using the email noted above