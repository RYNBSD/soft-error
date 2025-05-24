# soft-error

Lightweight TypeScript utilities for handling synchronous and asynchronous operations with built-in error management and unified result types.

---

## Table of Contents

- [soft-error](#soft-error)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Import](#import)
  - [Usage](#usage)
    - [`trySync`](#trysync)
    - [`catchSync`](#catchsync)
    - [`tryAsync`](#tryasync)
    - [`catchAsync`](#catchasync)
    - [Runtime Selectors: `_try` / `_catch`](#runtime-selectors-_try--_catch)
  - [API Reference](#api-reference)
  - [License](#license)

---

## Installation

```bash
npm install soft-error
# or
yarn add soft-error
```

---

## Import

```ts
import {
  trySync,
  catchSync,
  tryCatchSync, // deprecated alias for catchSync
  tryAsync,
  catchAsync,
  tryCatchAsync, // deprecated alias for catchAsync
  _try,
  _catch,
} from "soft-error";
```

---

## Usage

### `trySync`

Execute a synchronous function and optionally handle errors.
Swallows exceptions and returns `null` on failure, or the function’s return value on success.

```ts
import { trySync } from "soft-error";

const jsonString = '{ "foo": 42 }';

// no error handler
const obj1 = trySync(() => JSON.parse(jsonString));
// obj1 === { foo: 42 }

// with custom error handler
const obj2 = trySync(
  () => JSON.parse("invalid"),
  (err) => console.warn("parse failed:", err.message)
);
// obj2 === null
```

---

### `catchSync`

Execute a synchronous function and capture both value and error in a discriminated union.
Returns `{ value, error, ok }`.

```ts
import { catchSync } from "soft-error";

const result = catchSync<Error, number>(() => parseInt("123", 10));

if (result.ok) {
  console.log("Parsed number:", result.value);
} else {
  console.error("Parsing failed:", result.error);
}
```

> **Deprecated Alias:** > `tryCatchSync` is an alias for `catchSync` and will be removed in a future major release.

---

### `tryAsync`

Execute an asynchronous function or a `Promise`, optionally handle errors.
Swallows exceptions and returns `null` on failure, or resolves to the function’s return value on success.

```ts
import { tryAsync } from "soft-error";

async function loadData() {
  const data = await tryAsync(
    () => fetch("/api/data").then((res) => res.json()),
    (err) => console.error("Fetch failed:", err)
  );
  if (data !== null) {
    console.log("Data:", data);
  }
}
```

---

### `catchAsync`

Execute an asynchronous function or a `Promise`, capturing both value and error.
Returns a `Promise` resolving to `{ value, error, ok }`.

```ts
import { catchAsync } from "soft-error";

async function loadUser() {
  const result = await catchAsync<Error, User>(() => api.getUser(1));
  if (result.ok) {
    console.log("User:", result.value);
  } else {
    console.warn("Error loading user:", result.error);
  }
}
```

> **Deprecated Alias:** > `tryCatchAsync` is an alias for `catchAsync` and will be removed in a future major release.

---

### Runtime Selectors: `_try` / `_catch`

Choose sync vs. async variant at runtime. Useful when mode is dynamic:

```ts
import { _try, _catch } from "soft-error";

// pick the correct try function
const valueOrNull = _try<Error, number>("sync")(
  () => parseInt("42", 10),
  console.error
);

// pick the correct catch function
const result = await _catch<Error, number>("async")(
  () => fetchNumber(),
  console.error
);
```

---

## API Reference

```ts
// — Sync handlers —
export type FnSyncHandler<T> = () => T;
export type ErrorSyncHandler<E extends Error> = (error: E) => void;

/**
 * Executes a synchronous function, optionally handling errors.
 * @returns R on success; null on error.
 */
export function trySync<E extends Error, R>(
  fn: FnSyncHandler<R>,
  errorHandler?: ErrorSyncHandler<E>
): R | null;

/**
 * Discriminated union result type for sync operations.
 */
export type CatchResult<E extends Error, R> =
  | { value: R; error: null; ok: true }
  | { value: null; error: E; ok: false };

/**
 * Executes a synchronous function and captures value + error.
 */
export function catchSync<E extends Error, R>(
  fn: FnSyncHandler<R>
): CatchResult<E, R>;

/** @deprecated alias for catchSync */
export const tryCatchSync: typeof catchSync;

// — Async handlers —
export type FnAsyncHandler<T> = Promise<T> | (() => T | Promise<T>);
export type ErrorAsyncHandler<E extends Error> = (
  error: E
) => void | Promise<void>;

/**
 * Executes an asynchronous function or Promise, optionally handling errors.
 * @returns Promise<R> on success; Promise<null> on error.
 */
export function tryAsync<E extends Error, R>(
  fn: FnAsyncHandler<R>,
  errorHandler?: ErrorAsyncHandler<E>
): Promise<R | null>;

/**
 * Executes an asynchronous function or Promise and captures value + error.
 */
export function catchAsync<E extends Error, R>(
  fn: FnAsyncHandler<R>
): Promise<CatchResult<E, R>>;

/** @deprecated alias for catchAsync */
export const tryCatchAsync: typeof catchAsync;

// — Runtime selectors —
export function _try<E extends Error, R>(runTime: "sync"): typeof trySync<E, R>;
export function _try<E extends Error, R>(
  runTime: "async"
): typeof tryAsync<E, R>;

export function _catch<E extends Error, R>(
  runTime: "sync"
): typeof catchSync<E, R>;
export function _catch<E extends Error, R>(
  runTime: "async"
): typeof catchAsync<E, R>;
```

---

## License

MIT © RYN BSD
