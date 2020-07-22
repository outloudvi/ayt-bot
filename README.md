# Another Yanker for Telegram

...or let's call it another anti-spam bot for Telegram. The word "yank" comes from the editor vim. [What exactly is AYT?](https://suichyan-ha-kyoumokawaii.amebaownd.com/pages/3827499/page_202005050050)

## Usage

- Create a Telegram bot.
- Add its token to BOT_KEY in `wrangler.toml`.
- Deploy this to Cloudflare Workers.
- Set the webhook address of the bot to the address of the worker.
- Put the bot into your group and give it permissions.
