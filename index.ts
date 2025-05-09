/**
 * Synchronous function handler type.
 * Represents a function that takes no arguments and returns a value of type T.
 *
 * @template T - The type of the value returned by the handler.
 */
export type FnSyncHandler<T> = () => T;

/**
 * Synchronous error handler type.
 * A callback invoked when a synchronous error of type E is caught.
 *
 * @template E - The type of the Error to handle (extends Error).
 * @param error - The caught error instance.
 */
export type ErrorSyncHandler<E extends Error> = (error: E) => void;

/**
 * Executes a synchronous function handler and optionally handles errors.
 *
 * @template E - The specific Error subclass to catch and handle.
 * @template R - The return type of the function handler.
 *
 * @param fn - The function to execute.
 * @param errorHandler - Optional callback invoked with the caught error.
 * @returns The result of fn if successful, or null if an error was caught.
 *
 * @example
 * ```ts
 * const result = trySync(() => JSON.parse(jsonString), (err) => console.error(err));
 * if (result !== null) {
 *   // parsed successfully
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
    // Invoke the error handler if provided, then swallow the error
    errorHandler?.(err as E);
    return null;
  }
}

/**
 * The unified result of a synchronous try/catch operation.
 *
 * @template E - The Error type that may have been thrown.
 * @template R - The return type of the handler.
 */
export type TryCatchResult<E extends Error, R> =
  | {
      value: R;
      error: null;
      ok: true;
    }
  | {
      value: null;
      error: E;
      ok: false;
    };

/**
 * Executes a synchronous function handler, capturing its value and any error.
 *
 * @template E - The specific Error subclass to catch.
 * @template R - The return type of the function handler.
 *
 * @param fn - The function to execute.
 * @returns An object with `value`, `error`, and `ok` properties.
 *
 * @example
 * ```ts
 * const { value, error, ok } = tryCatchSync<Error, number>(() => parseInt('123'));
 * if (ok) console.log('Parsed:', value);
 * else console.error('Failed to parse:', error);
 * ```
 */
export function tryCatchSync<E extends Error, R>(
  fn: FnSyncHandler<R>
): TryCatchResult<E, R> {
  let error: E | null = null;
  const value = trySync<E, R>(fn, (err) => {
    error = err;
  });
  return error
    ? { value: null, error, ok: false }
    : { value: value as R, error: null, ok: true };
}

/**
 * Asynchronous function handler type.
 * Can be a Promise returning T, or a function that returns T or Promise<T>.
 *
 * @template T - The type of the successful result.
 */
export type FnAsyncHandler<T> = Promise<T> | (() => Promise<T> | T);

/**
 * Asynchronous error handler type.
 * A callback invoked when an error of type E is caught, may perform async side-effects.
 *
 * @template E - The specific Error subclass to handle.
 * @param error - The caught error instance.
 * @returns A Promise or void.
 */
export type ErrorAsyncHandler<E extends Error> = (
  error: E
) => Promise<void> | void;

/**
 * Executes an async or sync function/promise, optionally handling errors.
 *
 * @template E - The specific Error subclass to catch.
 * @template R - The return type of the handler.
 *
 * @param fn - A function or Promise to execute.
 * @param errorHandler - Optional async callback invoked on error.
 * @returns A Promise resolving to the result on success, or null if an error was caught.
 *
 * @example
 * ```ts
 * const data = await tryAsync<Error, User>(
 *   () => fetchUser(id),
 *   (err) => logError(err)
 * );
 * if (data) {
 *   // use data
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
 * Executes an async or sync function/promise, capturing its result and any error.
 *
 * @template E - The specific Error subclass to catch.
 * @template R - The return type of the handler.
 *
 * @param fn - A function or Promise to execute.
 * @returns A Promise resolving to a TryCatchResult with `value`, `error`, and `ok`.
 *
 * @example
 * ```ts
 * const { value, error, ok } = await tryCatchAsync<Error, number>(
 *   async () => parseIntAsync(str)
 * );
 * ```
 */
export async function tryCatchAsync<E extends Error, R>(
  fn: FnAsyncHandler<R>
): Promise<TryCatchResult<E, R>> {
  let error: E | null = null;
  const value = await tryAsync<E, R>(fn, (err) => {
    error = err;
  });
  return error
    ? { value: null, error, ok: false }
    : { value: value as R, error: null, ok: true };
}
