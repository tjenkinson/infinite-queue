[![npm version](https://badge.fury.io/js/infinite-queue.svg)](https://badge.fury.io/js/infinite-queue)

# Infinite Queue

A small library which implements a queue where you are able to request items early if the queue is empty.

## Installation

```sh
npm install --save infinite-queue
```

or available on JSDelivr at "https://cdn.jsdelivr.net/npm/infinite-queue@1".

## API

### `InfiniteQueue<TItem>()`

Create a queue.

### `queue.push(item: TItem): void`

Push an item onto the queue.

### `queue.next(): Promise<TItem>`

Returns a promise that will resolve with the oldest item in the queue, when there is one.

### `queue.next<TReturn>(onItem (item: TItem) => TReturn): Promise<TReturn>`

Provide an `onItem` callback which will be called immediately if there is already an item in the queue, or synchronously from the next `push()` call.

The promise returned from `next()` will resolve with whatever you return from `onItem`.

Use [`queue.next()`](#queuenext-promisetitem) unless you need to be notified synchronously.

### `queue.numItems()`

Returns the number of items remaining in the queue.

## Example

```ts
import { InfiniteQueue } from 'infinite-queue';

const queue = InfiniteQueue<string>();

queue.push('a');
console.log('pushed 1');
setTimeout(() => {
  queue.push('b');
  queue.push('c');
  console.log('pushed 2 and 3');
}, 1000);

console.log('waiting for 1');
console.log('got 1', await queue.next()));
console.log('waiting for 2');
console.log('got 2', await queue.next()));
console.log('waiting for 3');
console.log('got 3', await queue.next()));
```

This would output:

```
pushed 1
waiting for 1
got 1 a
waiting for 2
pushed 2 and 3
got 2 b
got 3 c
```
