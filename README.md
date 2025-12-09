# TG Tic‑Tac‑Toe (Mini App + Bot)

Структура:
- `webapp/` — React мини‑приложение (Telegram WebApp).
- `bot_py/` — Telegram-бот на python-telegram-bot 20 (Python 3.11+).

## Быстрый старт

1) Веб‑приложение
- Перейдите в `tg-tictactoe/webapp`
- `npm install`
- `npm run dev`
- Для реального открытия в Telegram нужен HTTPS‑хостинг (например, Vercel/Netlify) или туннель (ngrok). После деплоя получите URL.

2) Бот (Python)
- Перейдите в `tg-tictactoe/bot_py`
- Скопируйте `.env.example` в `.env` **или** создайте `.env` с переменными:
  ```
  BOT_TOKEN=<токен от BotFather>
  WEBAPP_URL=https://your-webapp-url
  ```
- Python 3.11 или 3.12:
  ```bash
  python3.12 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  python main.py
  ```

Откройте бот в Telegram, нажмите /start — появится кнопка «Играть». Мини‑приложение отправляет результат через `Telegram.WebApp.sendData`:
- Победа: бот пишет «Победа! Промокод выдан: [код]»
- Поражение: бот пишет «Проигрыш»

## Дизайн
- Тёплая палитра, мягкие тени, скругления.
- Спокойные анимации появления.

## Заметки
- В локальном браузере объект Telegram.WebApp подменён заглушкой для удобной разработки.
- В Telegram откройте мини‑приложение только из бота, чтобы `sendData` доходил в чат.
