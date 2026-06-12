# Подробная инструкция по записи demo video

Цель: записать понятный ролик длительностью примерно 2:45–3:15, в котором
судья увидит продукт, воспроизводимые доказательства и реальную интеграцию с
Mantle.

## На каком языке записывать

Рекомендуемый вариант:

- говорить на простом английском;
- использовать короткие предложения;
- не переживать из-за акцента;
- после загрузки добавить английские субтитры на YouTube.

Если говорить на английском тяжело:

- записывайте голос на русском;
- интерфейс и ключевые термины оставляйте на английском;
- обязательно добавьте английские субтитры;
- название и описание видео напишите на английском.

Для международного жюри английский голос лучше, но уверенный русский голос с
качественными английскими субтитрами лучше, чем плохо читаемый английский.

## Чем записывать

Подойдут:

- OBS Studio;
- Loom;
- Xbox Game Bar в Windows (`Win + G`);
- встроенная запись экрана в вашей программе монтажа.

Настройки:

- разрешение: минимум 1920×1080;
- частота кадров: 30 FPS достаточно;
- формат: MP4;
- записывать весь экран или только окно браузера;
- микрофон проверить отдельной короткой записью;
- системные уведомления временно отключить.

## Что закрыть перед записью

Закройте:

- Vercel Settings и Environment Variables;
- OpenAI API Keys;
- `.env` и терминалы с переменными окружения;
- MetaMask seed phrase или private key;
- password manager;
- Telegram, почту и личные вкладки;
- историю буфера обмена Windows;
- вкладки с банковскими и личными данными.

Не открывайте настройки Vercel во время ролика.

## Подготовьте браузер

Лучше использовать отдельное чистое окно браузера.

1. Нажмите `Ctrl + Shift + N` для окна Incognito/InPrivate.
2. Разверните окно на весь экран.
3. Установите масштаб страницы 110% или 125%:
   - нажмите `Ctrl + +` один или два раза;
   - текст должен хорошо читаться, но карточки не должны обрезаться.
4. Откройте вкладки строго в таком порядке:

### Вкладка 1 — Judge Center

Откройте:

`https://mantle-vibecheck.vercel.app/judges`

Оставьте страницу в самом верху.

### Вкладка 2 — Scanner

Откройте:

`https://mantle-vibecheck.vercel.app/#workbench`

Убедитесь, что видны:

- заголовок `Check a contract before it becomes an incident`;
- sample `VibeVault.sol`;
- кнопка `Run VibeCheck`.

Ничего не нажимайте до начала записи.

### Вкладка 3 — Benchmark

Откройте:

`https://github.com/dzod992-bit/mantle-vibecheck/blob/main/docs/BENCHMARK.md`

Прокрутите страницу к таблице `Current result`, чтобы были видны:

- `10 / 10` deterministic rules;
- `11` true positives;
- `0` false positives;
- `0` false negatives;
- `6 / 6` exact case matches.

### Вкладка 4 — Public proof

Откройте:

`https://mantle-vibecheck.vercel.app/proof/0xe52b3cc268f564d3a19a22d58393c10da6709c97b42f9a082d442a8d4d728088`

Дождитесь загрузки и убедитесь, что видна надпись:

`Proof matches the Mantle registry`

### Вкладка 5 — Verified contract

Откройте:

`https://sepolia.mantlescan.xyz/address/0xdf8e3b1d7332903a0ac6ed11c078e0c35a62ff52#code`

Дождитесь загрузки. Прокрутите так, чтобы были видны:

- `Contract Source Code Verified`;
- `Exact Match`;
- адрес контракта;
- вкладки `Read Contract` / `Write Contract`, если они помещаются.

## Пробный прогон без записи

Перед настоящим дублем один раз сделайте весь маршрут:

1. Judge Center.
2. Scanner.
3. Нажать `Run VibeCheck`.
4. Нажать `Generate AI threat model`.
5. Показать `Local fallback`.
6. Открыть `Review limitations`.
7. Переключиться на Benchmark.
8. Переключиться на Public proof.
9. Переключиться на MantleScan.
10. Вернуться на Judge Center.

Если какая-то страница загружается медленно, дождитесь её полной загрузки до
начала настоящей записи.

## Точный маршрут во время записи

### Сцена 1 — проблема и продукт, 0:00–0:20

На экране: вкладка `Judge Center`, верх страницы.

Что делать:

1. Начните запись.
2. Подождите одну секунду.
3. Медленно проведите курсором по заголовку
   `Trust the evidence, not the badge`.
4. Не прокручивайте страницу первые 10 секунд.
5. Затем немного прокрутите вниз до блока `Release snapshot`.

Простой английский текст:

> AI can generate Solidity in seconds, but speed does not prove security.
> Mantle VibeCheck finds reproducible risks, explains the fixes, and creates
> an audit proof that anyone can verify on Mantle.

Русский вариант:

> AI может написать Solidity за несколько секунд, но скорость не доказывает
> безопасность. Mantle VibeCheck находит воспроизводимые риски, объясняет
> исправления и создаёт audit proof, который любой человек может проверить в
> Mantle.

### Сцена 2 — детерминированный scanner, 0:20–0:58

На экране: вкладка `Scanner`.

Что делать:

1. Переключитесь на вкладку 2.
2. Курсором покажите sample `VibeVault.sol`.
3. Нажмите зелёную кнопку `Run VibeCheck`.
4. Дождитесь появления score `38/100`.
5. Медленно прокрутите правую колонку.
6. На секунду остановитесь на:
   - `State changes after an external value call`;
   - `Authorization depends on tx.origin`;
   - line numbers и severity.

Английский текст:

> The first layer is deterministic, not an AI guess. VibeCheck compiles the
> contract with Solidity 0.8.23, inspects the AST, and returns line-level
> evidence, severity, remediation, and a repeatable score.

Русский вариант:

> Первый слой детерминированный, это не догадка AI. VibeCheck компилирует
> контракт Solidity 0.8.23, анализирует AST и показывает строку кода,
> severity, исправление и воспроизводимый score.

### Сцена 3 — reasoning и patch, 0:58–1:28

На экране: всё ещё Scanner.

Что делать:

1. В правой колонке нажмите `Generate AI threat model`.
2. Дождитесь появления блока `Threat model`.
3. Покажите badge `Local fallback`.
4. Прокрутите threat model медленно.
5. Нажмите `Preview patched Solidity`, чтобы раскрыть исправленный код.
6. Через 2–3 секунды сверните его.
7. Нажмите `Review limitations`.
8. Покажите прозрачное сообщение о fallback/квоте.

Важно: `Local fallback` не нужно скрывать. Это демонстрирует, что продукт
работает воспроизводимо даже без оплаченного AI provider.

Английский текст:

> The reasoning layer can only explain findings produced by the deterministic
> engine. Its JSON output is validated, unknown rule IDs are rejected, and a
> proposed patch is compiled again before it is shown. When the provider is
> unavailable, the product clearly displays the deterministic fallback.

Русский вариант:

> Reasoning layer может объяснять только findings детерминированного движка.
> JSON проходит валидацию, неизвестные rule ID отклоняются, а предложенный
> patch компилируется повторно. Если AI provider недоступен, приложение честно
> показывает deterministic fallback.

### Сцена 4 — CLI, CI и benchmark, 1:28–1:58

На экране: вкладка `Benchmark`.

Что делать:

1. Переключитесь на вкладку 3.
2. Покажите таблицу `Current result`.
3. Курсором последовательно покажите:
   - `10 / 10`;
   - `11`;
   - `0`;
   - `0`;
   - `6 / 6`.
4. Немного прокрутите к таблице `Cases`.

Английский текст:

> The same engine runs in a local CLI and a GitHub Actions severity gate. The
> committed regression corpus covers all ten rules with six exact cases,
> eleven true positives, zero false positives, and zero false negatives on
> this public benchmark.

Русский вариант:

> Тот же движок работает через локальный CLI и GitHub Actions severity gate.
> Публичный regression corpus покрывает все десять правил: шесть exact cases,
> 11 true positives, ноль false positives и ноль false negatives на этом
> benchmark.

### Сцена 5 — on-chain proof, 1:58–2:28

На экране: вкладка `Public proof`.

Что делать:

1. Переключитесь на вкладку 4.
2. Покажите зелёный статус
   `Proof matches the Mantle registry`.
3. Медленно прокрутите поля:
   - code hash;
   - report hash;
   - publisher;
   - score;
   - published time.
4. Не нажимайте публикацию новой транзакции.

Английский текст:

> A publishable report is bound to the exact code hash, canonical report hash,
> model version, score, publisher, expiry, and nonce. This public page reads
> the record from Mantle, so the judge does not need to trust our database or
> an editable PDF.

Русский вариант:

> Публикуемый отчёт связан с точным code hash, report hash, model version,
> score, publisher, expiry и nonce. Public proof page читает запись из Mantle,
> поэтому судье не нужно доверять нашей базе данных или изменяемому PDF.

### Сцена 6 — verified contract, 2:28–2:48

На экране: вкладка `Verified contract`.

Что делать:

1. Переключитесь на вкладку 5.
2. Курсором покажите адрес контракта.
3. Покажите `Source Code Verified` и `Exact Match`.
4. Покажите Solidity `0.8.23`.
5. Не подключайте кошелёк и не нажимайте write-функции.

Английский текст:

> The AuditRegistry contract is deployed on Mantle Sepolia and its source code
> has an exact bytecode match. It verifies the EIP-712 signer, prevents nonce
> replay, and indexes proofs by source-code hash.

Русский вариант:

> AuditRegistry развёрнут в Mantle Sepolia, а исходный код имеет exact
> bytecode match. Контракт проверяет EIP-712 signer, защищает от повторного
> nonce и индексирует proofs по source-code hash.

### Сцена 7 — финал и business model, 2:48–3:05

На экране: снова `Judge Center`.

Что делать:

1. Переключитесь на вкладку 1.
2. Быстро прокрутите до блока `Business potential`.
3. Остановитесь на карточках:
   - `Free local gate`;
   - `Continuous review`;
   - `Release evidence`;
   - `Human audit handoff`.
4. Закончите ролик на верхней части Judge Center или на business cards.

Английский текст:

> The open-source CLI drives adoption. The business model is paid private
> repositories, team policies, continuous pull-request review, proof APIs, and
> responsible escalation to professional auditors. This is Mantle VibeCheck:
> ship at AI speed, but verify the evidence.

Русский вариант:

> Open-source CLI создаёт adoption. Монетизация строится на private
> repositories, team policies, continuous pull-request review, proof API и
> передаче сложных случаев профессиональным аудиторам. Это Mantle VibeCheck:
> выпускайте со скоростью AI, но проверяйте доказательства.

## Если что-то пошло не так

- Страница долго грузится: остановите дубль и начните заново после загрузки.
- Нажали не туда: не пытайтесь долго исправлять на записи; сделайте новый
  дубль.
- Не появился `Live AI`: показывайте `Local fallback`, это ожидаемый режим до
  пополнения OpenAI API balance.
- MetaMask открылся сам: закройте окно и перезапишите сцену.
- Не помещается текст: уменьшите масштаб один раз через `Ctrl + -`.
- Курсор дёргается: двигайте его только когда показываете конкретный элемент.

## После записи

1. Обрежьте тишину в начале и конце.
2. Уберите паузы загрузки длиннее 1–2 секунд.
3. Не ускоряйте интерфейс сильнее 1.25×.
4. Добавьте английские субтитры.
5. Экспортируйте MP4 в 1080p.
6. Загрузите на YouTube как `Unlisted` или `Public`.
7. Название:

   `Mantle VibeCheck — Verifiable AI-assisted Solidity Security`

8. Описание:

   ```text
   Mantle VibeCheck is an evidence-first security tool for vibe-coded Solidity.
   It combines deterministic AST analysis, validated remediation, CLI/CI
   workflow, reproducible benchmarks, and on-chain audit proofs on Mantle.

   Demo: https://mantle-vibecheck.vercel.app
   Judge Center: https://mantle-vibecheck.vercel.app/judges
   GitHub: https://github.com/dzod992-bit/mantle-vibecheck
   Contract: https://sepolia.mantlescan.xyz/address/0xdf8e3b1d7332903a0ac6ed11c078e0c35a62ff52#code
   ```

9. Проверьте видео в режиме Incognito: оно должно открываться без входа в ваш
   аккаунт.
10. Пришлите мне публичную YouTube-ссылку. Я внесу её во все submission-файлы
    и начну итерацию 16.
