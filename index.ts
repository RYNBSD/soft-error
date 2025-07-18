/**
 * Checks whether a given value is a Promise.
 *
 * @template T
 * @param {unknown} obj - The value to test.
 * @returns {obj is Promise<T>} True if obj implements .then as a function.
 */
export function isPromise<T>(obj: unknown): obj is Promise<T> {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof (obj as Promise<T>).then === "function"
  );
}

/**
 * A synchronous handler function returning R.
 *
 * @template R
 */
export type FnSyncHandler<R> = () => R;

/**
 * An asynchronous handler function returning Promise<R>.
 *
 * @template R
 */
export type FnAsyncHandler<R> = () => Promise<R>;

/**
 * A function to handle errors of type E.
 *
 * @template E
 * @param {E} error - The caught error.
 */
export type ErrorHandler<E extends Error> = (error: E) => void;

/**
 * Options for the synchronous version of _try.
 *
 * @template R, E
 * @property {FnSyncHandler<R>} handler - The function to execute.
 * @property {ErrorHandler<E>} [onError] - Called if handler throws.
 */
export type SyncOptions<R, E extends Error> = {
  handler: FnSyncHandler<R>;
  onError?: ErrorHandler<E>;
};

/**
 * Options for the asynchronous version of _try.
 *
 * @template R, E
 * @property {FnAsyncHandler<R>} handler - The async function to execute.
 * @property {ErrorHandler<E>} [onError] - Called if the promise rejects.
 */
export type AsyncOptions<R, E extends Error> = {
  handler: FnAsyncHandler<R>;
  onError?: ErrorHandler<E>;
};

/**
 * Union of sync and async options.
 *
 * @template R, E
 */
export type Options<R, E extends Error> =
  | SyncOptions<R, E>
  | AsyncOptions<R, E>;

/**
 * Safely executes a handler, catching sync exceptions or promise rejections.
 *
 * @template T, E
 * @overload
 * @param {AsyncOptions<T, E>} options - Async handler + optional error callback.
 * @returns {Promise<T|null>} Promise resolving to value or null on error.
 *
 * @overload
 * @param {SyncOptions<T, E>} options - Sync handler + optional error callback.
 * @returns {T|null} Value or null if handler threw.
 */
export function _try<T, E extends Error = Error>(
  options: AsyncOptions<T, E>
): Promise<T | null>;
export function _try<T, E extends Error = Error>(
  options: SyncOptions<T, E>
): T | null;
export function _try<T, E extends Error = Error>(options: Options<T, E>) {
  try {
    const rtn = options.handler();

    if (isPromise<T>(rtn)) {
      return rtn.then(
        (value: T) => value,
        (error: E) => {
          options.onError?.(error);
          return null;
        }
      );
    }

    return rtn;
  } catch (error) {
    options.onError?.(error as E);
    return null;
  }
}

/**
 * The result of calling `_catch`, representing success or failure.
 *
 * @template T, E
 */
export type CatchResult<T, E extends Error> =
  | {
      /** The successful return value. */
      value: T;
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
 * Executes a handler and returns a structured result, catching exceptions or promise rejections.
 *
 * @template T, E
 * @overload
 * @param {FnAsyncHandler<T>} handler - Async function to execute.
 * @returns {Promise<CatchResult<T, E>>}
 *
 * @overload
 * @param {FnSyncHandler<T>} handler - Sync function to execute.
 * @returns {CatchResult<T, E>}
 */
export function _catch<T, E extends Error = Error>(
  handler: FnAsyncHandler<T>
): Promise<CatchResult<T, E>>;
export function _catch<T, E extends Error = Error>(
  handler: FnSyncHandler<T>
): CatchResult<T, E>;
export function _catch<T, E extends Error = Error>(
  handler: FnSyncHandler<T> | FnAsyncHandler<T>
) {
  try {
    const result = handler();

    if (isPromise<T>(result)) {
      return result.then(
        (value: T) => ({ value, error: null, ok: true } as const),
        (error: E) => ({ value: null, error, ok: false } as const)
      );
    }

    return { value: result as T, error: null, ok: true } as const;
  } catch (err) {
    const error = err as E;
    return { value: null, error, ok: false } as const;
  }
}
