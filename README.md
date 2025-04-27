# soft-error

Simple TypeScript utilities for handling async/sync operations with built-in error management.

## Installation

```bash
npm install soft-error
# or
yarn add soft-error
```

## Usage

```ts
import { _try, tryCatch } from 'soft-error';
```

### _try

Run a handler (Promise or function), optionally handle errors, returns `null` on failure.

```ts
// async handler with custom error logging
const data = await _try(
  () => fetch('/api/data').then(r => r.json()),
  err => console.error('Fetch failed:', err.message)
);
// data: parsed JSON or null
```

```ts
// sync handler without error handler
const result = await _try(() => computeValue());
// result: number or null
```

### tryCatch

Run a handler, always returns an object `{ value, error, ok }`.

```ts
const { value, error, ok } = await tryCatch<Error, number>(() => {
  if (Math.random() < 0.5) throw new Error('Bad luck');
  return 100;
});

if (ok) {
  console.log('Got', value);
} else {
  console.error('Error occurred:', error);
}
```

```ts
// async example
const userResult = await tryCatch<Error, User>(async () => api.getUser(1));
if (!userResult.ok) {
  console.warn('Could not fetch user:', userResult.error);
}
```

## API

```ts
type FnHandler<T> = Promise<T> | (() => T | Promise<T>);
type ErrorHandler<E extends Error> = (err: E) => void | Promise<void>;

async function _try<E extends Error, R>(
  fn: FnHandler<R>,
  onError?: ErrorHandler<E>
): Promise<R | null>;

interface TryCatchResult<E extends Error, R> {
  value: R | null;
  error: E | null;
  ok: boolean;
}
async function tryCatch<E extends Error, R>(
  fn: FnHandler<R>
): Promise<TryCatchResult<E, R>>;
```

## License

MIT © RYN BSD
