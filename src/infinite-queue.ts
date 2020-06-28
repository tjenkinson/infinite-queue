import { Deferred, buildDeferred } from './build-deferred';

type Next<TItem> = {
  deferred: Deferred<any>;
  callback: OnItemCallback<TItem, any>;
};

export type InfiniteQueue<TItem> = {
  push: (item: TItem) => void;
  next(): Promise<TItem>;
  next<TReturn>(
    onItem: OnItemCallback<TItem, TReturn | PromiseLike<TReturn>>
  ): Promise<TReturn>;
  numItems: () => number;
  reset: () => void;
};
export type OnItemCallback<TItem, TReturn> = (item: TItem) => TReturn;

export const queueResetError = new Error('Queue has been reset.');

export function InfiniteQueue<TItem>(): InfiniteQueue<TItem> {
  const queue: TItem[] = [];
  const pendingNexts: Next<TItem>[] = [];

  function process(): void {
    if (!queue.length || !pendingNexts.length) {
      return;
    }

    const item = queue.shift()!;
    const next = pendingNexts.shift()!;
    try {
      next.deferred.resolve(next.callback(item));
    } catch (e) {
      next.deferred.reject(e);
    }
    process();
  }

  function next(): Promise<TItem>;
  function next<TReturn>(
    onItem: (item: TItem) => TReturn | PromiseLike<TReturn>
  ): Promise<TReturn>;
  function next<TReturn>(
    onItem?: (item: TItem) => TReturn | PromiseLike<TReturn>
  ): Promise<TReturn | TItem> {
    const callback = onItem || ((item: TItem) => item);
    const deferred = buildDeferred<TReturn>();
    pendingNexts.push({
      callback,
      deferred,
    });
    process();
    return deferred.promise;
  }

  function reset(): void {
    queue.splice(0, queue.length);
    pendingNexts.splice(0, pendingNexts.length).forEach(({ deferred }) => {
      deferred.reject(queueResetError);
    });
  }

  return {
    /**
     * Push an item onto the queue.
     */
    push(item: TItem): void {
      queue.push(item);
      process();
    },
    /**
     * Returns a promise that will resolve with the oldest item in the queue, when there is one.
     *
     * You can provide an `onItem` callback which will be called immediately if there is already an item in the queue, or synchronously from the next `push()` call.
     * The promise returned from `next()` will resolve with whatever you return from `onItem`.
     */
    next,
    /**
     * Returns the number of items remaining in the queue.
     */
    numItems: () => queue.length,
    /**
     * Clears the queue and rejects any pending `next()` promises with `queueResetError`.
     */
    reset,
  };
}
