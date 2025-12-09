import ngrok from 'ngrok'

const port = process.env.PORT || 5173

try {
  const url = await ngrok.connect({ addr: port, proto: 'http', authtoken: process.env.NGROK_AUTHTOKEN })
  console.log('\n[ngrok] Публичный URL для веб‑приложения:')
  console.log(url)
  console.log('\nСкопируйте этот URL в tg-tictactoe/bot/.env как WEBAPP_URL и перезапустите бота.')
  console.log('Пример: WEBAPP_URL=' + url + '\n')

  const shutdown = async () => {
    try {
      await ngrok.disconnect()
      await ngrok.kill()
    } finally {
      process.exit(0)
    }
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  await new Promise(() => {})
} catch (e) {
  console.error('[ngrok] Ошибка запуска туннеля:', e?.message || e)
  console.error('Убедитесь, что у вас настроен ngrok authtoken:')
  console.error('  1) Зарегистрируйтесь на https://ngrok.com')
  console.error('  2) Выполните: npx ngrok config add-authtoken <ВАШ_TOKEN>  (или экспортируйте NGROK_AUTHTOKEN)')
  process.exit(1)
}
