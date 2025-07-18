# soft-error

A tiny TypeScript utility to wrap synchronous or asynchronous functions in safe `try`/`catch` logic, returning `null` (for `_try`) or a structured result (for `_catch`) instead of throwing.

## Features

- `_try`: Executes code, catches errors or promise rejections, and returns either the result or `null`.
- `_catch`: Executes code, catches errors or promise rejections, and returns `{ value, error, ok }` for easier pattern matching.
- Works seamlessly with both sync and async handlers.
- Optional per-call error callbacks.

## Installation

```bash
npm install soft-error
# or
yarn add soft-error
```

### Usage

```ts
import { _try, _catch } from "soft-error";
```

`_try`

#### Signature

```ts
// Sync
function _try<T, E extends Error = Error>(opts: {
  handler: () => T;
  onError?: (err: E) => void;
}): T | null;

// Async
function _try<T, E extends Error = Error>(opts: {
  handler: () => Promise<T>;
  onError?: (err: E) => void;
}): Promise<T | null>;
```

- `handler`: Your function (sync or async).
- `onError` (optional): A callback invoked with the caught error; return value is ignored.

Returns the handler’s return value, or null if any exception/rejection occurred.

##### Examples

```ts
// Sync example
const result = _try({
  handler: () => JSON.parse('{"foo": 1}'),
  onError: (err) => console.error("Failed to parse:", err),
});
// result === { foo: 1 }

// Sync with error
const bad = _try({
  handler: () => JSON.parse("not valid"),
  onError: (err) => console.warn("Parse error"),
});
// bad === null

// Async example
(async () => {
  const data = await _try({
    handler: () => fetch("/api/data").then((r) => r.json()),
    onError: (err) => alert("Network error"),
  });
  // data is parsed JSON or null
})();
```

`_try`

#### Signature

```ts
// Sync
function _catch<T, E extends Error = Error>(
  handler: () => T
): { value: T; error: null; ok: true } | { value: null; error: E; ok: false };

// Async
function _catch<T, E extends Error = Error>(
  handler: () => Promise<T>
): Promise<
  { value: T; error: null; ok: true } | { value: null; error: E; ok: false }
>;
```

Returns an object:

- `ok: true` on success, with `value: T` and `error: null`.
- `ok: false` on failure, with `value: null` and `error: E`.

##### Examples

```ts
// Sync success
const result = _catch(() => 2 + 2);
// => { ok: true, value: 4, error: null }

// Sync failure
const failed = _catch(() => {
  throw new TypeError("oops");
});
// => { ok: false, value: null, error: TypeError("oops") }

// Async success
(async () => {
  const res = await _catch(() => Promise.resolve("hello"));
  // => { ok: true, value: "hello", error: null }
})();

// Async failure
(async () => {
  const res = await _catch(() => Promise.reject(new Error("fail")));
  // => { ok: false, value: null, error: Error("fail") }
})();
```

### API Reference

| Function         | Returns                                       | Description                                         |
| ---------------- | --------------------------------------------- | --------------------------------------------------- |
| `isPromise(obj)` | `obj is Promise<T>`                             | Type-guard to detect Promise-like values.           |
| `_try(opts)`     | `T \| null`or`Promise<T \| null>`             | Execute handler safely, return `null` on error.     |
| `_catch(fn)`     | `CatchResult<T, E>` or `Promise<CatchResult>` | Execute handler, return structured success/failure. |

# License

MIT © Rayen Boussayed
