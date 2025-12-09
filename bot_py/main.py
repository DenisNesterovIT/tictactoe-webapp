import os
import json
import logging
from dotenv import load_dotenv
from telegram import (KeyboardButton, ReplyKeyboardMarkup, WebAppInfo,
                      MenuButtonWebApp, Update)
from telegram.ext import (Application, CommandHandler, ContextTypes,
                          MessageHandler, filters)

load_dotenv()

logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')
log = logging.getLogger(__name__)

BOT_TOKEN = os.getenv('BOT_TOKEN')
WEBAPP_URL = (os.getenv('WEBAPP_URL') or '').strip()
IS_HTTPS = WEBAPP_URL.startswith('https://')

if not BOT_TOKEN:
    raise SystemExit('BOT_TOKEN is missing in environment (.env)')


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if IS_HTTPS:
        kb = ReplyKeyboardMarkup.from_button(
            KeyboardButton(text='Играть 🎯', web_app=WebAppInfo(url=WEBAPP_URL))
        )
        await update.effective_message.reply_text(
            'Добро пожаловать! Нажмите «Играть», чтобы открыть мини‑приложение.',
            reply_markup=kb,
        )
        try:
            await context.bot.set_chat_menu_button(
                chat_id=update.effective_chat.id,
                menu_button=MenuButtonWebApp(text='Играть', web_app=WebAppInfo(url=WEBAPP_URL)),
            )
        except Exception as e:
            log.warning('set_chat_menu_button failed: %s', e)
    else:
        await update.effective_message.reply_text(
            'Укажите HTTPS WEBAPP_URL (ngrok/Vercel/Netlify) и перезапустите бота.'
        )


async def on_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    msg = update.effective_message
    wad = getattr(msg, 'web_app_data', None)
    if not wad or not wad.data:
        return
    log.info('web_app_data raw: %s', wad.data)
    try:
        data = json.loads(wad.data)
    except Exception as e:
        log.error('web_app_data parse error: %s', e)
        await msg.reply_text('Не удалось обработать данные от мини‑приложения.')
        return

    t = data.get('type')
    if t == 'win' and 'code' in data:
        await msg.reply_text(f"Победа! Промокод выдан: {data['code']}")
    elif t == 'loss':
        await msg.reply_text('Проигрыш')
    else:
        await msg.reply_text('Данные получены')


def main() -> None:
    application = Application.builder().token(BOT_TOKEN).build()
    application.add_handler(CommandHandler('start', start))
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, on_message))
    application.run_polling(close_loop=False, allowed_updates=Update.ALL_TYPES)


if __name__ == '__main__':
    main()
