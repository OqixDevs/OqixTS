<p align="center">
  <a href="https://github.com/OqixDevs/OqixTS">
    <img src="https://raw.githubusercontent.com/OqixDevs/OqixTS/master/avatar/oqix-hq.png" width="200" alt="Oqix logo" />
  </a>
</p>
<h2 align="center">OqixTS</h2>
<p align="center">Discord BOT intended for FIT@FI server.</p>
<p align="center">
  <a href="https://github.com/OqixDevs/OqixTS/actions?query=workflow%3A%22Pull+request+workflow%22++">
    <img alt="Build Status" src="https://img.shields.io/github/workflow/status/OqixDevs/OqixTS/Pull%20request%20workflow">
  </a>
  <a href="https://github.com/OqixDevs/OqixTS">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/OqixDevs/OqixTS">
  </a>
<a href="https://github.com/OqixDevs/OqixTS/tags">
    <img alt="Latest GitHub tag" src="https://img.shields.io/github/v/tag/OqixDevs/OqixTS">
  </a>
<a href="https://github.com/OqixDevs/OqixTS/blob/master/LICENSE">
    <img alt="Latest GitHub tag" src="https://img.shields.io/github/license/OqixDevs/OqixTS">
  </a>
</p>

---
OqixTS is a bot used in FIT@FI discord. This bot has following functionalinty:

- Verify users
- Print out information how many credits you will receive for course recognition
- Prune spam messages
- Announce message
- Restart
- Whoami - prints user info
- Whois - print info about user

---

## :desktop_computer: Development setup
This app uses NodeJS to setup dev environment use [npm](https://www.npmjs.com/) and run following command:
```shell
npm i
```

App expects some environment variables to set them you can create `.env` file and enter following:
```shell
DISCORD_TOKEN=<BOT_TOKEN>
CLIENT_ID=<APPLICATION_ID>
GUILD_ID=<SERVER_ID>
```
To get bot token you have to [create bot first](https://discord.com/developers/docs/getting-started#creating-an-app).
How to get server id and application id you can find [here](https://support-dev.discord.com/hc/en-us/articles/360028717192-Where-can-I-find-my-Application-Team-Server-ID-).

Let bot join the server entering following url in the browser:
```
https://discord.com/api/oauth2/authorize?client_id={CLIENT_ID}&permissions=0&scope=bot%20applications.commands

```

Next run the app:
```shell
npm run start
```

## :whale: Docker setup

This app uses docker for deployment you can build container by running:
```shell
docker build -t oqix .
```
For running this app in container it is suggested to setup environment variables manually running:
```shell
export DISCORD_TOKEN=<BOT_TOKEN>
export CLIENT_ID=<APPLICATION_ID>
export GUILD_ID=<SERVER_ID>

```
Then run the app in container using:
```shell
docker run -it -e DISCORD_TOKEN=$DISCORD_TOKEN -e CLIENT_ID=$CLIENT_ID -e GUILD_ID=$GUILD_ID oqix:latest
```
