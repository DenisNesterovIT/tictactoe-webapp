import 'dotenv/config'
import { Telegraf, Markup } from 'telegraf'

const token = process.env.BOT_TOKEN
const webAppUrl = process.env.WEBAPP_URL
const isHttps = typeof webAppUrl === 'string' && webAppUrl.startsWith('https://')

if (!token) {
  console.error('BOT_TOKEN is missing. Put it into .env')
  process.exit(1)
}

const bot = new Telegraf(token)

// Optional: set chat menu button to open the Mini App (for private chats)
if (isHttps) {
  bot.telegram.setChatMenuButton({
    menu_button: {
      type: 'web_app',
      text: 'Играть',
      web_app: { url: webAppUrl }
    }
  }).catch(() => {})
}

bot.start((ctx) => {
  if (isHttps) {
    const inline = Markup.inlineKeyboard([
      [Markup.button.webApp('Играть 🎯', webAppUrl)]
    ])
    return ctx.reply('Добро пожаловать! Нажмите «Играть», чтобы открыть мини‑приложение.', inline)
  }
  return ctx.reply('Добро пожаловать! Чтобы появилась кнопка, укажите HTTPS‑ссылку WEBAPP_URL (ngrok/деплой) и перезапустите бота.')
})

// Receive data from Mini App
bot.on('message', async (ctx) => {
  const wa = ctx.message?.web_app_data
  if (wa?.data) {
    try {
      const data = JSON.parse(wa.data)
      if (data.type === 'win' && data.code) {
        await ctx.reply(`Победа! Промокод выдан: ${data.code}`)
      } else if (data.type === 'loss') {
        await ctx.reply('Проигрыш')
      } else {
        await ctx.reply('Данные получены')
      }
    } catch (e) {
      await ctx.reply('Не удалось обработать данные от мини‑приложения.')
    }
  }
})

bot.launch().then(() => console.log('Bot started'))

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
