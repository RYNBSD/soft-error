/**
 * A handler that either is a Promise of T,
 * or a function returning either T or a Promise of T.
 *
 * @template T - The type of the successful result.
 */
export type FnHandler<T> = Promise<T> | (() => Promise<T> | T);

/**
 * A handler for errors of type E.
 * It receives the caught error and may perform async side-effects.
 *
 * @template E - The specific Error subclass being handled.
 * @param error - The error that was thrown.
 * @returns A Promise or void.
 */
export type ErrorHandler<E extends Error> = (error: E) => Promise<void> | void;

/**
 * Attempts to run a function or promise, and optionally handles any error.
 *
 * @template E - The Error type to catch.
 * @template R - The return type of the handler.
 *
 * @param fnHandler - Either a Promise<R> or a function that returns R or Promise<R>.
 * @param errorHandler - Optional callback to handle any error of type E.
 *
 * @returns A Promise that resolves to the result R on success, or null if an error was caught.
 */
export async function _try<E extends Error, R>(
  fnHandler: FnHandler<R>,
  errorHandler?: ErrorHandler<E>
): Promise<R | null> {
  try {
    // If fnHandler is a function, invoke it; otherwise treat it as a Promise<R>
    const p = typeof fnHandler === "function" ? fnHandler() : fnHandler;
    const result = await p;
    return result;
  } catch (error) {
    // If provided, call the error handler, then swallow the error
    await errorHandler?.(error as E);
    return null;
  }
}

/**
 * The result object returned by `tryCatch`, containing success or error info.
 *
 * @template E - The Error type that may have been thrown.
 * @template R - The return type of the handler.
 */
export type TryCatchResult<E extends Error, R> = {
  /** The successful result, or null if an error occurred. */
  value: R | null;
  /** The caught error, or null if execution succeeded. */
  error: E | null;
  /** True if execution succeeded (no error), false otherwise. */
  ok: boolean;
};

/**
 * Runs a function or promise, capturing both its result and any thrown error.
 *
 * @template E - The Error type to catch.
 * @template R - The return type of the handler.
 *
 * @param fnHandler - Either a Promise<R> or a function returning R or Promise<R>.
 * @returns A Promise resolving to a TryCatchResult, with `value`, `error`, and `ok` flag.
 */
export async function tryCatch<E extends Error, R>(
  fnHandler: FnHandler<R>
): Promise<TryCatchResult<E, R>> {
  let error: E | null = null;

  // Use _try to execute fnHandler and capture any error into our `error` variable
  const value = await _try<E, R>(fnHandler, (err) => {
    error = err;
  });

  return {
    value,
    error,
    ok: !error,
  };
}
