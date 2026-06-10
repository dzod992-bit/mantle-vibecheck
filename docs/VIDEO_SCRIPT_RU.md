# Сценарий demo video

Целевая длительность: 2 минуты 55 секунд. Записывайте весь экран, но заранее
закройте `.env`, Vercel Settings, password manager и вкладки с кошельком.

## 0:00-0:18 - Проблема и Judge Center

Откройте:

`https://mantle-vibecheck.vercel.app/judges`

Текст:

> AI может написать Solidity-контракт за несколько секунд, но скорость не
> объясняет, где код потеряет деньги. Mantle VibeCheck превращает быстрый
> vibe-coded контракт в понятный security review и проверяемое on-chain
> доказательство.

## 0:18-0:53 - Детерминированный scan

1. Покажите sample `VibeVault`.
2. Нажмите `Run VibeCheck`.
3. Покажите score, reentrancy, `tx.origin` и номера строк.

Текст:

> Сначала работает не чат-бот, а воспроизводимый анализ Solidity 0.8.23 AST.
> Он находит опасные паттерны, показывает точную строку и рассчитывает
> детерминированный score.

## 0:53-1:23 - Threat model и patch

1. Покажите executive summary.
2. Пролистайте assets, threats и controls.
3. Откройте patched source.
4. Покажите метку `Local fallback`, если AI API key не настроен.

Текст:

> Затем AI layer превращает подтверждённые findings в threat model и
> remediation plan. Ответ проходит строгую schema validation. Если provider
> недоступен, приложение честно показывает deterministic fallback, а не
> выдумывает результат.

## 1:23-1:48 - CLI, CI и benchmark

Вернитесь в Judge Center. Покажите карточки `CLI + CI gate` и
`11 TP · 0 FP · 0 FN`, затем откройте benchmark.

Текст:

> Тот же движок запускается локально и в pull request. Версионированный
> benchmark покрывает все 10 правил: шесть exact-match cases, 11 true
> positives, без false positives и false negatives на публичном corpus.

## 1:48-2:12 - Подписанный proof

Покажите блок публикации. Для стабильной записи видео можно использовать уже
опубликованный proof и не отправлять повторную транзакцию.

Текст:

> Отчёт связывается с code hash, report hash, model hash, score, severity
> counts, publisher, expiry и nonce. Backend подписывает EIP-712 payload, а
> пользователь публикует его собственным кошельком.

## 2:12-2:34 - Public proof

Откройте:

`https://mantle-vibecheck.vercel.app/proof/0xe52b3cc268f564d3a19a22d58393c10da6709c97b42f9a082d442a8d4d728088`

Покажите `Proof matches the Mantle registry`.

Текст:

> Public proof page читает запись напрямую из Mantle. Проверяющему не нужно
> доверять нашей базе данных или изменяемому PDF.

## 2:34-2:47 - Verified contract

Откройте:

`https://sepolia.mantlescan.xyz/address/0xdf8e3b1d7332903a0ac6ed11c078e0c35a62ff52#code`

Покажите `Source Code Verified`, `Exact Match`, Solidity 0.8.23 и Read/Write
tabs.

## 2:47-2:55 - Финал

Текст:

> Mantle VibeCheck помогает выпускать контракты со скоростью AI, не заставляя
> пользователей доверять непрозрачному security badge. Open-source CLI
> создаёт adoption, а team workflow и proof API дают путь к монетизации.

Покажите Judge Center, demo URL и GitHub.
