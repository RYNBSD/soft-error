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
import {
  trySync,
  tryCatchSync,
  tryAsync as _try,
  tryCatchAsync as tryCatch,
} from "soft-error";
```

### `trySync`

Execute a synchronous function handler, optionally handling errors. Returns `null` on failure.

```ts
// sync handler with custom error logging
const value = trySync(
  () => JSON.parse(jsonString),
  (err) => console.error("Parse failed:", err.message)
);
// value: parsed object or null
```

### `tryCatchSync`

Execute a synchronous handler, capturing both result and error in an object.

```ts
const result = tryCatchSync<Error, number>(() => parseInt(input, 10));
if (result.ok) {
  console.log("Parsed:", result.value);
} else {
  console.error("Sync error:", result.error);
}
```

### `tryAsync` (_alias: `_try`_)

Run an async/sync handler (function or Promise), optionally handling errors. Returns `null` on failure.

```ts
// async handler with custom error logging
const data = await _try(
  () => fetch("/api/data").then((r) => r.json()),
  (err) => console.error("Fetch failed:", err.message)
);
// data: parsed JSON or null
```

### `tryCatchAsync` (_alias: `tryCatch`_)

Run an async/sync handler, capturing result and error.

```ts
const userResult = await tryCatch<Error, User>(async () => api.getUser(1));
if (userResult.ok) {
  console.log("User:", userResult.value);
} else {
  console.warn("Async error:", userResult.error);
}
```

## API Reference

```ts
// Sync handlers
export type FnSyncHandler<T> = () => T;
export type ErrorSyncHandler<E extends Error> = (error: E) => void;
function trySync<E extends Error, R>(
  fn: FnSyncHandler<R>,
  errorHandler?: ErrorSyncHandler<E>
): R | null;
function tryCatchSync<E extends Error, R>(
  fn: FnSyncHandler<R>
): TryCatchResult<E, R>;

// Async handlers
export type FnAsyncHandler<T> = Promise<T> | (() => T | Promise<T>);
export type ErrorAsyncHandler<E extends Error> = (
  error: E
) => void | Promise<void>;
async function tryAsync<E extends Error, R>(
  fn: FnAsyncHandler<R>,
  errorHandler?: ErrorAsyncHandler<E>
): Promise<R | null>;
async function tryCatchAsync<E extends Error, R>(
  fn: FnAsyncHandler<R>
): Promise<TryCatchResult<E, R>>;

// Shared result type
export type TryCatchResult<E extends Error, R> = {
  /** The returned value on success, or null on failure. */
  value: R | null;
  /** The caught error on failure, or null on success. */
  error: E | null;
  /** True if operation succeeded, false if an error was caught. */
  ok: boolean;
};
```

## License

MIT © RYN BSD
