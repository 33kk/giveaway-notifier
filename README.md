# Giveaway Notifier

Scrapes https://www.gamerpower.com/giveaways/pc and sends notification if new giveaway exists.

# Usage

## Install dependencies

With pnpm: `pnpm install`

## Run manually

`pnpm run run` or `node .`

## Run automatically

### Cron

```*/30 * * * * XDG_RUNTIME_DIR=/run/user/$(id -u) node /path/to/giveaway-notifier/index.js```
