# OqixTS
Discord BOT intended for FIT@FI server.


## Development setup :desktop_computer:
This app uses NodeJS to run install app packages use [npm](https://www.npmjs.com/)
```shell
npm i
```
To run the app create .env file in projects root containing following
```shell
DISCORD_TOKEN=<BOT_TOKEN>
CLIENT_ID=<APPLICATION_ID>
GUILD_ID=<SERVER_ID>
```
To get bot token you have to [create bot first](https://discord.com/developers/docs/getting-started#creating-an-app).
How to get server id and application id you can find [here](https://support-dev.discord.com/hc/en-us/articles/360028717192-Where-can-I-find-my-Application-Team-Server-ID-)

Let bot join the server entering following url in the browser
```
https://discord.com/api/oauth2/authorize?client_id={CLIENT_ID}&permissions=0&scope=bot%20applications.commands

```

Next run the app
```shell
npm run start
```
