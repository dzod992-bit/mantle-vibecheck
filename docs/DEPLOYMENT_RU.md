# Deployment и эксплуатация

## Текущий production

- Frontend: `https://mantle-vibecheck.vercel.app`
- Network: Mantle Sepolia, chain ID `5003`
- Registry: `0xdf8e3b1d7332903a0ac6ed11c078e0c35a62ff52`
- MantleScan:
  `https://sepolia.mantlescan.xyz/address/0xdf8e3b1d7332903a0ac6ed11c078e0c35a62ff52`
- Verification: `Source Code Verified`, `Exact Match`
- Sourcify:
  `https://repo.sourcify.dev/5003/0xDf8E3b1D7332903a0aC6Ed11C078E0c35a62ff52`

Публичные deployment-данные находятся в
`deployments/mantleSepolia.json`. Секретов в этом файле нет.

## Локальная конфигурация

Создайте `.env` на основе `.env.example`:

```powershell
Copy-Item .env.example .env
```

Основные переменные:

```text
MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
MANTLE_DEPLOYER_PRIVATE_KEY=0x...
AUDIT_TRUSTED_SIGNER=0x...
AUDIT_SIGNER_PRIVATE_KEY=0x...
NEXT_PUBLIC_MANTLE_CHAIN_ID=5003
NEXT_PUBLIC_AUDIT_REGISTRY_ADDRESS=0x...
```

`MANTLE_DEPLOYER_PRIVATE_KEY` принадлежит owner-кошельку.
`AUDIT_SIGNER_PRIVATE_KEY` принадлежит отдельному signer без средств.
Ни один private key нельзя добавлять в Git.

## Проверки и сборка

```powershell
npm.cmd ci
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

## Новый deployment контракта

```powershell
npm.cmd run contracts:compile
npm.cmd run contracts:test
npm.cmd run contracts:deploy:mantle
```

После deployment обновите frontend address и выполните verification.

## Sourcify verification

Сначала скомпилируйте контракт и создайте standard JSON:

```powershell
npm.cmd run contracts:compile
npm.cmd run contracts:verification-input
```

Затем запустите:

```powershell
npm.cmd run contracts:verify:sourcify
```

Команда:

1. проверяет, существует ли уже exact match;
2. при необходимости отправляет standard JSON и creation transaction hash;
3. ждёт завершения verification;
4. завершается с ошибкой, если exact match не получен.

`constructorArguments` в deployment metadata содержат именно первоначальные
адреса конструктора. Текущие owner и signer могут отличаться после rotation.

Если автоматическая verification недоступна, используйте MantleScan:

1. Откройте contract address.
2. Выберите `Contract` -> `Verify and Publish`.
3. Выберите `Solidity (Standard-Json-Input)`.
4. Compiler: `0.8.23`.
5. Загрузите `AuditRegistry.standard-input.json`.
6. Вставьте содержимое `AuditRegistry.constructor-args.txt` без `0x`.

Etherscan API key для текущего deployment не требуется.

## Rotation signer

Запишите новый signer address в `AUDIT_TRUSTED_SIGNER`, а его private key в
`AUDIT_SIGNER_PRIVATE_KEY`:

```powershell
npm.cmd run contracts:rotate-signer:mantle
```

После транзакции:

1. обновите `AUDIT_SIGNER_PRIVATE_KEY` в Vercel Production;
2. redeploy frontend;
3. вызовите `/api/review` и проверьте EIP-712 signature.

## Rotation owner

Запишите новый owner private key в `MANTLE_NEW_OWNER_PRIVATE_KEY`:

```powershell
npm.cmd run contracts:rotate-owner:mantle
```

Owner/deployer key никогда не должен находиться в Vercel.

## Vercel

Production environment:

```text
NEXT_PUBLIC_MANTLE_CHAIN_ID=5003
NEXT_PUBLIC_AUDIT_REGISTRY_ADDRESS=0xdf8e3b1d7332903a0ac6ed11c078e0c35a62ff52
AUDIT_SIGNER_PRIVATE_KEY=<sensitive>
```

Опционально можно добавить AI provider:

```text
AI_API_KEY=<sensitive>
AI_MODEL=...
AI_API_BASE_URL=https://api.openai.com/v1
```

Без AI key приложение использует явно обозначенный deterministic fallback.
`.vercelignore` исключает `.env`, `.env.*`, artifacts и verification input.

## Smoke test

- Главная страница открывается без login.
- Sample scan выдаёт детерминированные findings.
- Threat model и patched source отображаются.
- `/api/review` возвращает EIP-712 proof.
- Wallet переключается на Mantle Sepolia.
- Publish создаёт транзакцию.
- `/proof/<auditId>` читает запись из Mantle.
- MantleScan показывает verified exact-match source code.
