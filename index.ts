export function isPromise<T>(obj: unknown): obj is Promise<T> {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof (obj as Promise<T>).then === "function"
  );
}

export type FnSyncHandler<R> = () => R;
export type FnAsyncHandler<R> = () => Promise<R>;

export type ErrorHandler<E extends Error> = (error: E) => void;

export type SyncOptions<R, E extends Error> = {
  handler: FnSyncHandler<R>;
  onError?: ErrorHandler<E>;
};

export type AsyncOptions<R, E extends Error> = {
  handler: FnAsyncHandler<R>;
  onError?: ErrorHandler<E>;
};

export type Options<R, E extends Error> =
  | SyncOptions<R, E>
  | AsyncOptions<R, E>;

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
