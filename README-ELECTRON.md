# Test Plan Manager - Electron App

Кроссплатформенное десктопное приложение для управления тест-кейсами.

## Разработка

### Запуск в режиме разработки

```bash
# Терминал 1: Next.js dev сервер
npm run dev

# Терминал 2: Electron (после запуска Next.js)
npm run start:electron
```

Или одной командой:
```bash
npm run dev:electron
```

### Сборка

```bash
# Собрать для macOS (DMG)
npm run build:mac

# Собрать для macOS App Store (MAS)
npm run build:mac-store

# Собрать для Windows
npm run build:win

# Собрать для всех платформ
npm run build:all
```

## Структура проекта

```
├── electron/           # Electron main process
│   ├── main.ts        # Main process entry
│   ├── preload.ts     # Preload script
│   └── tsconfig.json  # TypeScript config
├── build/             # Build resources
│   ├── entitlements.mac.plist
│   ├── entitlements.mas.plist
│   └── entitlements.mas.inherit.plist
├── app/               # Next.js app router
├── components/        # React components
├── domains/           # Business logic
└── prisma/            # Database schema
```

## Публикация в App Store

### Требования

1. Apple Developer Account
2. Certificates (Developer ID Application, Mac App Distribution)
3. Provisioning Profile

### Шаги

1. Поместить `embedded.provisionprofile` в `build/`
2. Настроить код-подпись в `electron-builder.yml`
3. Запустить `npm run build:mac-store`
4. Загрузить `.pkg` в App Store Connect

## Хранение данных

- **База данных**: `~/Library/Application Support/test-plan-manager/database/dev.db`
- **Файлы**: `~/Library/Application Support/test-plan-manager/files/`
- **Настройки**: `~/Library/Application Support/test-plan-manager/settings.json`
