# @ooneex/country

A comprehensive country data library for TypeScript applications with timezone support and multi-language localization. This package provides type-safe access to country information, timezone data, and localized country names in English, French, and Romanian.

![Browser](https://img.shields.io/badge/Browser-Compatible-green?style=flat-square&logo=googlechrome)
![Bun](https://img.shields.io/badge/Bun-Compatible-orange?style=flat-square&logo=bun)
![Deno](https://img.shields.io/badge/Deno-Compatible-blue?style=flat-square&logo=deno)
![Node.js](https://img.shields.io/badge/Node.js-Compatible-green?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Features

✅ **Country Data** - Complete list of countries with ISO codes and names

✅ **Timezone Support** - Full timezone data powered by @vvo/tzdb

✅ **Multi-Language** - Localized country names in English, French, and Romanian

✅ **Type-Safe** - Full TypeScript support with proper type definitions

✅ **Zero Config** - Ready to use out of the box

✅ **Lightweight** - Minimal bundle size with tree-shakeable exports

## Installation

### Bun
```bash
bun add @ooneex/country
```

### pnpm
```bash
pnpm add @ooneex/country
```

### Yarn
```bash
yarn add @ooneex/country
```

### npm
```bash
npm install @ooneex/country
```

## Usage

### Basic Usage

```typescript
import type { CountryType, TimeZoneType } from '@ooneex/country';

// Type-safe country codes
const country: CountryType = 'US';
const timezone: TimeZoneType = 'America/New_York';
```

### Country Data (English)

```typescript
import { COUNTRIES } from '@ooneex/country';

// Access all countries
COUNTRIES.forEach(country => {
  console.log(`${country.name} (${country.code})`);
});

// Find a specific country
const usa = COUNTRIES.find(c => c.code === 'US');
console.log(usa?.name); // "United States"

// Filter countries
const europeanCountries = COUNTRIES.filter(c => 
  ['FR', 'DE', 'IT', 'ES', 'GB'].includes(c.code)
);
```

### French Localization

```typescript
import { COUNTRIES } from '@ooneex/country/fr';

// Countries with French names
COUNTRIES.forEach(country => {
  console.log(`${country.name} (${country.code})`);
});

const france = COUNTRIES.find(c => c.code === 'FR');
console.log(france?.name); // "France"

const usa = COUNTRIES.find(c => c.code === 'US');
console.log(usa?.name); // "États-Unis"
```

### Romanian Localization

```typescript
import { COUNTRIES } from '@ooneex/country/ro';

// Countries with Romanian names
const romania = COUNTRIES.find(c => c.code === 'RO');
console.log(romania?.name); // "România"

const germany = COUNTRIES.find(c => c.code === 'DE');
console.log(germany?.name); // "Germania"
```

### Working with Timezones

```typescript
import type { TimeZoneType } from '@ooneex/country';

// Type-safe timezone strings
const parisTime: TimeZoneType = 'Europe/Paris';
const tokyoTime: TimeZoneType = 'Asia/Tokyo';
const newYorkTime: TimeZoneType = 'America/New_York';

// Use with Date APIs
const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: parisTime,
  dateStyle: 'full',
  timeStyle: 'long'
});

console.log(formatter.format(new Date()));
```

### Country Selection Component (React Example)

```typescript
import { COUNTRIES } from '@ooneex/country';
import type { CountryType } from '@ooneex/country';

function CountrySelect({ 
  value, 
  onChange 
}: { 
  value: CountryType; 
  onChange: (code: CountryType) => void;
}) {
  return (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value as CountryType)}
    >
      {COUNTRIES.map(country => (
        <option key={country.code} value={country.code}>
          {country.name}
        </option>
      ))}
    </select>
  );
}
```

## API Reference

### Constants

#### `COUNTRIES`

Array of country objects with code and name.

```typescript
const COUNTRIES: readonly { code: string; name: string }[];
```

**Example:**
```typescript
import { COUNTRIES } from '@ooneex/country';

console.log(COUNTRIES[0]); // { code: 'AF', name: 'Afghanistan' }
```

### Types

#### `CountryType`

Union type of all valid ISO 3166-1 alpha-2 country codes.

```typescript
type CountryType = 'AF' | 'AL' | 'DZ' | 'US' | 'FR' | /* ... */ ;
```

**Example:**
```typescript
import type { CountryType } from '@ooneex/country';

const country: CountryType = 'US'; // ✓ Valid
const invalid: CountryType = 'XX'; // ✗ TypeScript error
```

#### `CountryNameType`

Union type of all country names (in English).

```typescript
type CountryNameType = 'Afghanistan' | 'Albania' | 'United States' | /* ... */ ;
```

#### `TimeZoneType`

Union type of all valid IANA timezone identifiers.

```typescript
type TimeZoneType = 
  | 'Africa/Abidjan'
  | 'America/New_York'
  | 'Asia/Tokyo'
  | 'Europe/Paris'
  | /* ... */ ;
```

**Example:**
```typescript
import type { TimeZoneType } from '@ooneex/country';

const tz: TimeZoneType = 'Europe/London'; // ✓ Valid
const invalid: TimeZoneType = 'Invalid/Zone'; // ✗ TypeScript error
```

### Interfaces

#### `ICountry`

Interface for country entities extending the base interface.

```typescript
interface ICountry extends IBase {
  name: string;
  code: string;
}
```

**Properties:**
- `id` - Unique identifier (from IBase)
- `name` - Country name
- `code` - ISO 3166-1 alpha-2 country code
- `createdAt` - Creation timestamp (from IBase)
- `updatedAt` - Update timestamp (from IBase)

## Module Exports

### Main Export (`@ooneex/country`)

- English country names
- All type definitions
- Timezone types

### French Export (`@ooneex/country/fr`)

- French localized country names
- Same structure as main export

### Romanian Export (`@ooneex/country/ro`)

- Romanian localized country names
- Same structure as main export

## Advanced Usage

### Multi-Language Country Selector

```typescript
import { COUNTRIES as COUNTRIES_EN } from '@ooneex/country';
import { COUNTRIES as COUNTRIES_FR } from '@ooneex/country/fr';
import { COUNTRIES as COUNTRIES_RO } from '@ooneex/country/ro';
import type { CountryType, LocaleType } from '@ooneex/country';

const countryLists = {
  en: COUNTRIES_EN,
  fr: COUNTRIES_FR,
  ro: COUNTRIES_RO
};

function getCountryName(code: CountryType, locale: 'en' | 'fr' | 'ro'): string {
  const countries = countryLists[locale];
  const country = countries.find(c => c.code === code);
  return country?.name ?? code;
}

console.log(getCountryName('DE', 'en')); // "Germany"
console.log(getCountryName('DE', 'fr')); // "Allemagne"
console.log(getCountryName('DE', 'ro')); // "Germania"
```

### Timezone Utilities

```typescript
import type { TimeZoneType } from '@ooneex/country';

function formatInTimezone(date: Date, timezone: TimeZoneType): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(date);
}

const now = new Date();
console.log(formatInTimezone(now, 'America/Los_Angeles'));
console.log(formatInTimezone(now, 'Europe/Paris'));
console.log(formatInTimezone(now, 'Asia/Tokyo'));
```

### Country Code Validation

```typescript
import { COUNTRIES } from '@ooneex/country';
import type { CountryType } from '@ooneex/country';

function isValidCountryCode(code: string): code is CountryType {
  return COUNTRIES.some(country => country.code === code);
}

const input = 'US';

if (isValidCountryCode(input)) {
  // TypeScript knows `input` is CountryType here
  const country = COUNTRIES.find(c => c.code === input);
  console.log(country?.name);
}
```

### Integration with Forms

```typescript
import { COUNTRIES } from '@ooneex/country';
import type { CountryType } from '@ooneex/country';

interface AddressForm {
  street: string;
  city: string;
  postalCode: string;
  country: CountryType;
}

function validateAddress(form: AddressForm): boolean {
  const validCountry = COUNTRIES.some(c => c.code === form.country);
  
  if (!validCountry) {
    throw new Error('Invalid country code');
  }
  
  return true;
}
```

### Cron Job with Timezone

```typescript
import { Cron, type CronTimeType } from '@ooneex/cron';
import type { TimeZoneType } from '@ooneex/country';

class DailyReportCron extends Cron {
  public getTime(): CronTimeType {
    return 'every 24 hours';
  }

  public getTimeZone(): TimeZoneType {
    return 'Europe/Paris'; // Run at Paris time
  }

  public async job(): Promise<void> {
    await this.generateReport();
  }
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Clone the repository
2. Install dependencies: `bun install`
3. Run tests: `bun run test`
4. Build the project: `bun run build`

### Guidelines

- Write tests for new features
- Follow the existing code style
- Update documentation for API changes
- Ensure all tests pass before submitting PR
- Add new localizations following the existing pattern

---

Made with ❤️ by the Ooneex team
