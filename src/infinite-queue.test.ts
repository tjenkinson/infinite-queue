import { InfiniteQueue, queueResetError } from './infinite-queue';

describe('InfiniteQueue', () => {
  it('calls next synchronously on a push', () => {
    const fn = jest.fn();
    const queue = InfiniteQueue<number>();
    queue.next(fn);

    queue.push(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1);
  });

  it('calls next immediately when there is something waiting', () => {
    const fn = jest.fn();
    const queue = InfiniteQueue<number>();

    queue.push(1);
    queue.next(fn);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1);
  });

  it('resolves next with the return value', async () => {
    const queue = InfiniteQueue<number>();

    queue.push(1);

    expect(await queue.next(() => 2)).toBe(2);
  });

  it('handles multiple items waiting', async () => {
    const queue = InfiniteQueue<number>();

    queue.push(1);
    queue.push(2);

    await queue.next((input) => expect(input).toBe(1));
    await queue.next((input) => expect(input).toBe(2));
  });

  it('handles multiple waiting next calls', async () => {
    const queue = InfiniteQueue<number>();

    const promise1 = queue.next((input) => expect(input).toBe(1));
    const promise2 = queue.next((input) => expect(input).toBe(2));

    queue.push(1);
    queue.push(2);

    await promise1;
    await promise2;
  });

  it('handles next call pushing something else', async () => {
    const queue = InfiniteQueue<number>();
    queue.push(1);
    await queue.next(() => queue.push(2));
    await queue.next((input) => expect(input).toBe(2));
  });

  it('rejects the promise from next() if callback throws', (done) => {
    const queue = InfiniteQueue<number>();
    queue.push(1);
    const mockError = new Error();
    queue
      .next(() => {
        throw mockError;
      })
      .then(() => done.fail())
      .catch((e) => {
        expect(e).toBe(mockError);
        done();
      });
  });

  it('returns the correct number of items', async () => {
    const queue = InfiniteQueue<number>();
    expect(queue.numItems()).toBe(0);
    queue.push(1);
    expect(queue.numItems()).toBe(1);
    queue.push(2);
    expect(queue.numItems()).toBe(2);
    await queue.next(() => {
      expect(queue.numItems()).toBe(1);
    });
    expect(queue.numItems()).toBe(1);
    await queue.next(() => {});
    expect(queue.numItems()).toBe(0);
  });

  it('resolves with the iten when there is no callback', async () => {
    const queue = InfiniteQueue<number>();
    queue.push(1);
    queue.push(2);
    expect(await queue.next()).toBe(1);
    expect(await queue.next()).toBe(2);
  });

  it('clears the queue on reset()', async () => {
    const queue = InfiniteQueue<number>();
    queue.push(1);
    queue.push(2);

    expect(queue.numItems()).toBe(2);
    queue.reset();
    expect(queue.numItems()).toBe(0);

    queue.push(3);
    expect(await queue.next()).toBe(3);
  });

  it('rejects pending next() calls on reset()', (done) => {
    const queue = InfiniteQueue<number>();
    const promise = queue.next();
    queue.reset();

    promise
      .then(() => done.fail())
      .catch((e) => {
        expect(e).toBe(queueResetError);
        done();
      })
      .catch(done.fail);
  });
});
