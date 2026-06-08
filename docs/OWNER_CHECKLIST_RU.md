# Что осталось сделать владельцу проекта

Техническая часть готова. Ниже только действия, которые требуют вашего
аккаунта, голоса или подтверждения личности.

## Уже готово

- Публичный GitHub:
  `https://github.com/dzod992-bit/mantle-vibecheck`
- Production demo:
  `https://mantle-vibecheck.vercel.app`
- Контракт в Mantle Sepolia:
  `0xdf8e3b1d7332903a0ac6ed11c078e0c35a62ff52`
- Контракт имеет `Source Code Verified` и `Exact Match` на MantleScan.
- Публичный proof:
  `https://mantle-vibecheck.vercel.app/proof/0xe52b3cc268f564d3a19a22d58393c10da6709c97b42f9a082d442a8d4d728088`
- Owner и production signer разделены.
- Vercel содержит только signer key; owner key туда не передавался.

## 1. Зарегистрироваться на DoraHacks

1. Откройте:
   `https://dorahacks.io/hackathon/mantleturingtesthackathon2026`.
2. Войдите в свой аккаунт DoraHacks.
3. Нажмите `Register as Hacker`, если регистрация ещё не завершена.
4. Заполните имя, фото и публичное описание профиля.
5. Создайте BUIDL для трека `AI DevTools`.
6. Пока не нажимайте последнюю кнопку отправки, если видео и X thread ещё не
   опубликованы.

Текст для полей BUIDL находится в `docs/DORAHACKS_SUBMISSION.md`.

## 2. Записать demo video

1. Откройте `docs/VIDEO_SCRIPT_RU.md`.
2. Записывайте экран в разрешении не ниже 1080p.
3. Покажите live demo, результат сканирования, threat model, public proof и
   verified contract.
4. Не показывайте `.env`, private keys, seed phrase, Vercel environment
   variables или содержимое буфера обмена.
5. Загрузите видео на YouTube как `Public` или `Unlisted`.
6. Сохраните публичную ссылку.

## 3. Опубликовать X thread

1. Откройте `docs/X_THREAD.md`.
2. Замените `[DEMO_VIDEO_URL]` на ссылку на видео.
3. Прикрепите указанные скриншоты.
4. Опубликуйте посты по порядку со своего публичного аккаунта.
5. Проверьте наличие `#MantleAIHackathon` и упоминания
   `@Mantle_Official`.
6. Сохраните ссылку на первый пост thread.

## 4. Завершить DoraHacks submission

1. Вставьте ссылку на видео.
2. Вставьте ссылку на X thread.
3. Ещё раз проверьте demo, GitHub и contract URL.
4. Выберите трек `AI DevTools`.
5. Выполните preview submission.
6. Нажмите финальную отправку до **15 июня 2026 года**.

## Безопасность

- Никому не отправляйте seed phrase, private key, password или recovery code.
- Не добавляйте owner/deployer key в Vercel.
- Не показывайте секреты в видео или скриншотах.
- AI API key необязателен: production прозрачно работает в deterministic
  fallback mode.
