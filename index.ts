/**
 * Synchronous function handler type.
 * Represents a function that takes no arguments and returns a value of type T.
 * Use this when you need to execute a synchronous computation that may succeed or throw.
 *
 * @template T - The type of the value returned by the handler.
 */
export type FnSyncHandler<T> = () => T;

/**
 * Synchronous error handler type.
 * Callback invoked when a synchronous error of type E is caught during execution.
 *
 * @template E - The type of the Error to handle (must extend Error).
 * @param error - The caught error instance for inspection or logging.
 */
export type ErrorSyncHandler<E extends Error> = (error: E) => void;

/**
 * Executes a synchronous function handler and optionally handles errors.
 *
 * @template E - The specific Error subclass to catch and handle.
 * @template R - The return type of the function handler.
 *
 * @param fn - The function to execute. If it completes successfully, its return
 *   value is returned.
 * @param errorHandler - Optional callback invoked with the caught error of type E.
 *   Allows custom error processing (e.g., logging) before swallowing the exception.
 * @returns The result of fn if successful, or null if an error was caught.
 *
 * @throws Will not throw; errors are caught and passed to errorHandler if provided.
 *
 * @example
 * ```ts
 * // Parse JSON safely, logging errors without throwing
 * const result = trySync<Error, any>(
 *   () => JSON.parse(jsonString),
 *   (err) => console.error('JSON parse failed', err)
 * );
 * if (result !== null) {
 *   console.log('Parsed JSON:', result);
 * }
 * ```
 */
export function trySync<E extends Error, R>(
  fn: FnSyncHandler<R>,
  errorHandler?: ErrorSyncHandler<E>
): R | null {
  try {
    const result = fn();
    return result;
  } catch (err) {
    errorHandler?.(err as E);
    return null;
  }
}

/**
 * The unified result of a synchronous try/catch operation.
 * Provides a discriminated union with explicit `value`, `error`, and `ok` fields.
 *
 * @template E - The Error type that may have been thrown.
 * @template R - The return type of the handler.
 */
export type CatchResult<E extends Error, R> =
  | {
      /** The successful return value. */
      value: R;
      /** Always null when ok is true. */
      error: null;
      /** Indicates success. */
      ok: true;
    }
  | {
      /** Always null when ok is false. */
      value: null;
      /** The caught error instance. */
      error: E;
      /** Indicates failure. */
      ok: false;
    };

/**
 * @deprecated Use {@link catchSync} instead.
 *
 * Maintained for backward compatibility.
 */
export const tryCatchSync = catchSync;

/**
 * Executes a synchronous function handler, capturing its return value and any thrown error.
 *
 * @template E - The specific Error subclass to catch and record.
 * @template R - The return type of the function handler.
 *
 * @param fn - The function to execute under try/catch.
 * @returns An object of type {@link CatchResult} containing `value`, `error`, and `ok`.
 *
 * @example
 * ```ts
 * const result = catchSync<Error, number>(() => parseInt('123', 10));
 * if (result.ok) {
 *   console.log('Parsed number:', result.value);
 * } else {
 *   console.error('Parsing failed:', result.error);
 * }
 * ```
 */
export function catchSync<E extends Error, R>(
  fn: FnSyncHandler<R>
): CatchResult<E, R> {
  let error: E | null = null;
  const value = trySync<E, R>(fn, (err) => {
    error = err;
  });
  if (error) {
    return { value: null, error, ok: false };
  }
  return { value: value as R, error: null, ok: true };
}

/**
 * Asynchronous function handler type.
 * Represents either a Promise yielding T, or a zero-argument function returning
 * T or Promise<T>.
 *
 * @template T - The type of the successful result.
 */
export type FnAsyncHandler<T> = Promise<T> | (() => Promise<T> | T);

/**
 * Asynchronous error handler type.
 * A callback invoked when an error of type E is caught during async execution.
 * Supports performing asynchronous side-effects (e.g., remote logging).
 *
 * @template E - The specific Error subclass to handle.
 * @param error - The caught error instance for inspection or logging.
 * @returns A Promise or void; if Promise, execution awaits its completion.
 */
export type ErrorAsyncHandler<E extends Error> = (
  error: E
) => Promise<void> | void;

/**
 * Executes an async or sync function/promise, optionally handling errors.
 *
 * @template E - The specific Error subclass to catch and handle.
 * @template R - The return type of the handler.
 *
 * @param fn - A function or Promise to execute. If a function, it will be invoked.
 * @param errorHandler - Optional async callback invoked on caught error.
 * @returns A Promise resolving to the result of fn on success, or null if an error was caught.
 *
 * @example
 * ```ts
 * async function loadUser() {
 *   const user = await tryAsync<Error, User>(
 *     () => fetchUserById(1),
 *     (err) => console.error('Fetch failed', err)
 *   );
 *   if (user) {
 *     console.log('User loaded:', user);
 *   }
 * }
 * ```
 */
export async function tryAsync<E extends Error, R>(
  fn: FnAsyncHandler<R>,
  errorHandler?: ErrorAsyncHandler<E>
): Promise<R | null> {
  try {
    const promise = typeof fn === "function" ? fn() : fn;
    const result = await promise;
    return result;
  } catch (err) {
    await errorHandler?.(err as E);
    return null;
  }
}

/**
 * @deprecated Use {@link catchAsync} instead.
 */
export const tryCatchAsync = catchAsync;

/**
 * Executes an async or sync function/promise, capturing its result and any thrown error.
 *
 * @template E - The specific Error subclass to catch and record.
 * @template R - The return type of the handler.
 *
 * @param fn - A function or Promise to execute under try/catch semantics.
 * @returns A Promise resolving to an object of type {@link CatchResult}.
 *
 * @example
 * ```ts
 * async function parseNumberAsync(str: string) {
 *   const result = await catchAsync<Error, number>(
 *     () => Promise.resolve(parseInt(str, 10))
 *   );
 *   if (result.ok) {
 *     console.log('Parsed:', result.value);
 *   } else {
 *     console.error('Error:', result.error);
 *   }
 * }
 * ```
 */
export async function catchAsync<E extends Error, R>(
  fn: FnAsyncHandler<R>
): Promise<CatchResult<E, R>> {
  let error: E | null = null;
  const value = await tryAsync<E, R>(fn, (err) => {
    error = err;
  });
  if (error) {
    return { value: null, error, ok: false };
  }
  return { value: value as R, error: null, ok: true };
}

/**
 * Internal runtime selector for synchronous or asynchronous try.
 *
 * @internal
 * @param runTime - Indicates which variant to return: "sync" or "async".
 * @returns The corresponding try function.
 * @throws If an unsupported runTime is provided.
 */
export function _try<E extends Error, R>(runTime: "sync"): typeof trySync<E, R>;
export function _try<E extends Error, R>(
  runTime: "async"
): typeof tryAsync<E, R>;
export function _try<E extends Error, R>(runTime: RunTime) {
  switch (runTime) {
    case "sync":
      return trySync<E, R>;
    case "async":
      return tryAsync<E, R>;
    default:
      throw new Error(`Unsupported run time: ${runTime}`);
  }
}

/**
 * Internal runtime selector for synchronous or asynchronous catch.
 *
 * @internal
 * @param runTime - Indicates which variant to return: "sync" or "async".
 * @returns The corresponding catch function.
 * @throws If an unsupported runTime is provided.
 */
export function _catch<E extends Error, R>(
  runTime: "sync"
): typeof catchSync<E, R>;
export function _catch<E extends Error, R>(
  runTime: "async"
): typeof catchAsync<E, R>;
export function _catch<E extends Error, R>(runTime: RunTime) {
  switch (runTime) {
    case "sync":
      return catchSync<E, R>;
    case "async":
      return catchAsync<E, R>;
    default:
      throw new Error(`Unsupported run time: ${runTime}`);
  }
}

/**
 * Supported runtime modes.
 *
 * @internal
 */
type RunTime = "sync" | "async";
