# Пошаговый deployment

Эти действия выполняются владельцем аккаунтов. Никому не передавайте seed
phrase, private key, пароль, recovery code или API key.

## 1. Создать отдельный MetaMask-кошелёк

1. Откройте MetaMask.
2. Нажмите название текущего аккаунта.
3. Выберите `Add account or hardware wallet` -> `Add a new Ethereum account`.
4. Назовите его `Mantle VibeCheck`.
5. Это должен быть отдельный тестовый аккаунт без реальных средств.

## 2. Добавить Mantle Sepolia

В MetaMask нажмите название сети -> `Add a custom network` и заполните:

- Network name: `Mantle Sepolia`
- Default RPC URL: `https://rpc.sepolia.mantle.xyz`
- Chain ID: `5003`
- Currency symbol: `MNT`
- Block explorer: `https://sepolia.mantlescan.xyz`

Нажмите `Save`, затем переключитесь на `Mantle Sepolia`.

## 3. Получить testnet MNT

1. Откройте официальный faucet:
   `https://faucet.sepolia.mantle.xyz/`.
2. Подключите только отдельный тестовый кошелёк.
3. Запросите MNT.
4. Проверьте баланс в MetaMask.

Если официальный faucet временно не выдаёт токены, запасные ссылки указаны в
официальной документации Mantle:
`https://docs.mantle.xyz/network/for-developers/quick-access`.

## 4. Создать локальный `.env`

В корне проекта выполните:

```powershell
Copy-Item .env.example .env
```

Откройте `.env` и заполните:

```text
MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
MANTLE_DEPLOYER_PRIVATE_KEY=0x...
AUDIT_TRUSTED_SIGNER=0xPUBLIC_WALLET_ADDRESS
```

Private key берётся только у отдельного тестового аккаунта и вставляется
только в локальный `.env`. Не отправляйте его в чат. Файл исключён из Git.

Как экспортировать ключ тестового аккаунта в MetaMask:

1. Переключитесь на аккаунт `Mantle VibeCheck`.
2. Нажмите меню с тремя точками рядом с именем аккаунта.
3. Откройте `Account details` -> `Show private key`.
4. Введите пароль MetaMask.
5. Вставьте ключ только в `MANTLE_DEPLOYER_PRIVATE_KEY` локального `.env`.
6. В `AUDIT_TRUSTED_SIGNER` вставьте публичный адрес этого же аккаунта.
7. Очистите буфер обмена и закройте экран с ключом.

Для первого testnet demo допускается использовать этот же тестовый аккаунт
как owner и trusted signer. До mainnet signer необходимо отделить от owner.

## 5. Развернуть AuditRegistry

```powershell
npm.cmd run contracts:compile
npm.cmd run contracts:test
npm.cmd run contracts:deploy:mantle
```

После успешного deployment появится:

```text
deployments/mantleSepolia.json
```

В нём будет публичный адрес контракта. Этот файл можно и нужно закоммитить.

## 6. Верифицировать контракт

1. Выполните:

```powershell
npm.cmd run contracts:verification-input
```

2. Откройте адрес контракта на
   `https://sepolia.mantlescan.xyz`.
3. Откройте вкладку `Contract`.
4. Нажмите `Verify and Publish`.
5. Выберите `Solidity (Standard-Json-Input)`.
6. Compiler: `0.8.23`.
7. License: `MIT`.
8. Загрузите созданный файл `AuditRegistry.standard-input.json`.
9. Откройте файл `AuditRegistry.constructor-args.txt`, который команда создала
   рядом со Standard JSON.
10. Вставьте всю строку из файла в поле `Constructor Arguments ABI-encoded`.
    Префикс `0x` добавлять не нужно.
11. Завершите verification и проверьте, что появился read/write interface.

Названия кнопок MantleScan могут незначительно отличаться.

## 7. Настроить приложение

Создайте `.env.local`:

```text
NEXT_PUBLIC_MANTLE_CHAIN_ID=5003
NEXT_PUBLIC_AUDIT_REGISTRY_ADDRESS=0xDEPLOYED_CONTRACT
AUDIT_SIGNER_PRIVATE_KEY=0x...
AI_API_KEY=...
AI_MODEL=...
AI_API_BASE_URL=https://api.openai.com/v1
```

`AUDIT_SIGNER_PRIVATE_KEY` должен соответствовать `AUDIT_TRUSTED_SIGNER`.
`MANTLE_DEPLOYER_PRIVATE_KEY` в Vercel добавлять не нужно.

Проверьте локально:

```powershell
npm.cmd run dev
```

## 8. Развернуть frontend в Vercel

1. Откройте `https://vercel.com`.
2. Войдите через GitHub.
3. Нажмите `Add New` -> `Project`.
4. Выберите публичный репозиторий `mantle-vibecheck`.
5. Framework должен определиться как `Next.js`.
6. Откройте `Environment Variables`.
7. Добавьте переменные из раздела 7.
8. Нажмите `Deploy`.
9. После deployment откройте публичный URL и выполните полный demo flow.

## 9. Финальная проверка

- GitHub публичный.
- CI зелёный.
- Frontend открывается без login.
- Contract verified на MantleScan.
- Wallet подключается к chain ID 5003.
- Scan и AI review работают.
- Publish proof создаёт транзакцию.
- `/proof/<auditId>` показывает on-chain запись.
- Видео длится не меньше 2 минут.
