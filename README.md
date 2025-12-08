# Fiutami Frontend

Angular 18 PWA for pet management application.

## Tech Stack

- **Framework**: Angular 18
- **UI**: Custom SCSS design system
- **State**: Angular Signals + Services
- **PWA**: Service Worker + Manifest
- **i18n**: @ngx-translate

## Quick Start

```bash
# Install dependencies
npm install

# Development server
npm start
# Navigate to http://localhost:4200

# Build for production
npm run build

# Run tests
npm test
```

## Project Structure

```
src/
├── app/
│   ├── core/           # Guards, services, interceptors
│   ├── shared/         # Common components
│   ├── features/       # Feature modules
│   │   ├── auth/       # Login, register
│   │   ├── user/       # Dashboard, profile, settings
│   │   └── pet/        # Pet management
│   └── layouts/        # Page layouts
├── assets/             # Images, icons, i18n
└── styles/             # Global SCSS, tokens
```

## Environment Variables

```bash
# src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  googleClientId: 'your-client-id'
};
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm test` | Run unit tests |
| `npm run lint` | ESLint check |

## Docker

```bash
# Build image
docker build -t fiutami/frontend .

# Run container
docker run -p 80:80 fiutami/frontend
```

## Related Repositories

- [backend](https://github.com/fiutami/backend) - .NET 8 API
- [testing](https://github.com/fiutami/testing) - E2E Playwright tests
- [infra](https://github.com/fiutami/infra) - CI/CD templates
