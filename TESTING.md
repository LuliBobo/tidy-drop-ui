# Testing Guide

Tento projekt používa **Jest** pre backend testy a **Vitest** pre frontend testy.

## Konfiguračné súbory

### Jest konfigurácia (`jest.config.cjs`)
- Testové prostredie: `jsdom` 
- Setup súbor: `jest.setup.ts`
- Support pre TypeScript a JSX
- Podporuje CSS modul mocking cez `identity-obj-proxy`

### Jest setup (`jest.setup.ts`)
- Načítava `@testing-library/jest-dom` pre dodatočné matchers
- Mock pre Electron APIs

## Štruktúra testov

```
tests/
├── backend/          # Jest testy pre backend logiku
│   ├── *.test.ts     # Backend unit testy
│   └── *.spec.ts     # Backend integration testy
└── frontend/         # Jest testy pre React komponenty
    ├── *.test.tsx    # Frontend komponent testy  
    └── *.spec.tsx    # Frontend integration testy
```

## NPM skripty

### Backend testy (Jest)
```bash
npm run test:backend              # Spustí všetky backend testy
npm run test:backend:watch        # Spustí testy v watch mode  
npm run test:backend:coverage     # Spustí testy s coverage reportom
```

### Frontend testy (Vitest)
```bash
npm run test:frontend             # Spustí všetky frontend testy
npm run test:watch               # Spustí frontend testy v watch mode
npm run test:coverage            # Spustí frontend testy s coverage
```

### Všetky testy
```bash
npm test                         # Spustí backend aj frontend testy
npm run test:all                 # Alias pre npm test
```

## Príklady testov

### Backend test (Jest)
```typescript
import { describe, test, expect } from '@jest/globals';
import * as path from 'path';

describe('File Operations', () => {
  test('should handle file paths correctly', () => {
    const result = path.join('/home/user', 'file.txt');
    expect(result).toBe('/home/user/file.txt');
  });
});
```

### Frontend test (Jest + Testing Library)
```typescript
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

const TestComponent = () => <div>Hello World</div>;

describe('TestComponent', () => {
  test('should render text', () => {
    render(<TestComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

## Užitočné tipy

1. **Jest DOM matchers**: Použite `@testing-library/jest-dom` pre lepšie assertions
2. **File mocking**: Pre CSS súbory sa používa `identity-obj-proxy`
3. **TypeScript warnings**: `esModuleInterop` je zapnutý v `tsconfig.json`
4. **Watch mode**: Ideálny pre development - automaticky reruns testy pri zmenách

## Debugging

Ak máte problémy s testami:
1. Skontrolujte, že je `jest-environment-jsdom` nainštalovaný
2. Overte, že `identity-obj-proxy` je v devDependencies
3. Skontrolujte cesty v `testMatch` patterns v `jest.config.cjs`
