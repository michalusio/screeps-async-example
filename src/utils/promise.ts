/**
 * Running - the promise is running and waiting for resolution
 * Resolved - the promise has been succesfully resolved and is caching the value
 * Rejected - the promise has resulted in an error and is caching the error
 * Waiting - the promise has been created and is waiting for execution
 * Suspended - the promise is waiting for another promise to finish
 */
type PromiseState = 'Running' | 'Resolved' | 'Rejected' | 'Waiting' | 'Suspended';


class MyPromise<T> {

  private state: PromiseState = 'Waiting';
  private data: T | unknown | undefined;

  private thens: MyPromise<unknown>[] = [];

  constructor(private body: (resolve: (value: T) => void, reject: (error: unknown) => void) => void, addToQueue: boolean = true) {
    if (addToQueue) {
      promiseQueue.push(this);
    }
  }

  public static all<T>(promises: MyPromise<T>[]): MyPromise<T[]> {
    const promiseData: [MyPromise<T>, T | undefined][] = promises.map(p => ([p, undefined]));
    return new MyPromise((resolve, reject) => {
      let done = 0;
      promiseData.forEach(([pr], i) => pr.then(result => {
        promiseData[i][1] = result;
        done += 1;
        if (done === promiseData.length) {
          resolve(promiseData.map(p => p[1]!));
        }
      }).catch(err => reject(err)));
    });
  }

  public static race<T>(promises: MyPromise<T>[]): MyPromise<T> {
    let done = false;
    return new MyPromise((resolve, reject) => {
      promises.forEach(p => {
        p.then(v => {
          if (!done) {
            done = true;
            resolve(v);
          }
        });
        p.catch(v => {
          if (!done) {
            done = true;
            reject(v);
          }
        });
      });
    });
  }

  public static reject(err: unknown): MyPromise<any> {
    return new MyPromise((_, reject) => reject(err));
  }

  public static resolve<T>(value: T): MyPromise<T> {
    return new MyPromise((resolve) => resolve(value));
  }

  public then<V>(map: (value: T) => V): MyPromise<V> {
    const promise = new MyPromise<V>((resolve, reject) => {
      if (this.state === 'Resolved') {
        try {
          resolve(map(this.data as T))
        } catch(err) {
          reject(err);
        }
      } else reject(this.data);
    }, false);
    if (this.state === 'Rejected' || this.state === 'Resolved') {
      promiseQueue.push(promise);
    } else {
      promise.state = 'Suspended';
      this.thens.push(promise);
    }
    return promise;
  }

  public catch<V>(map: (error: unknown) => V): MyPromise<T | V> {
    const promise = new MyPromise<T | V>((resolve, reject) => {
      if (this.state === 'Rejected') {
        try {
          resolve(map(this.data));
        }
        catch(err) {
          reject(err);
        }
      } else {
        resolve(this.data as T);
      }
    }, false);
    if (this.state === 'Rejected' || this.state === 'Resolved') {
      promiseQueue.push(promise);
    } else {
      promise.state = 'Suspended';
      this.thens.push(promise);
    }
    return promise;
  }

  public finally(action: () => void): MyPromise<void> {
    const promise = new MyPromise<void>((resolve, __) => {
      try {
        action();
      }
      finally {
        resolve();
      }
    }, false);
    if (this.state === 'Rejected' || this.state === 'Resolved') {
      promiseQueue.push(promise);
    } else {
      promise.state = 'Suspended';
      this.thens.push(promise);
    }
    return promise;
  }

  private runBody() {
    const setState = (state: 'Resolved' | 'Rejected') => (data: T | unknown) => {
      if (this.state === 'Running') {
        this.state = state;
        this.data = data;
        promiseQueue.splice(promiseQueue.findIndex(p => p === this), 1);
        this.thens.forEach(p => {
          p.state = 'Waiting';
        });
        promiseQueue.push(...this.thens);
        if (this.state === 'Rejected' && this.thens.length === 0) {
          if (this.data instanceof Error) {
            throw this.data;
          } else throw new Error(this.data + '');
        }
      } else if (data instanceof Error) throw data;
    }
    const resolveFunction: (value: T) => void = setState('Resolved');
    const rejectFunction: (error: unknown) => void = setState('Rejected');
    this.state = 'Running';
    try {
      this.body(
        resolveFunction,
        rejectFunction,
      )
    } catch(err) {
      rejectFunction(err);
    }
  }

  /**
   * Starts running the promises. Finishes only when all the promises have been finalized.
   */
  public static startPromiseLoop(): void {
    while (promiseQueue.length) {
      const promise = promiseQueue.find(p => p.state === 'Waiting');
      if (!promise) break;
      promise.runBody();
    }
  }
}

const promiseQueue: MyPromise<unknown>[] = [];

export const overWritePromise = () => globalThis.Promise = MyPromise as any;
export const startPromiseLoop = MyPromise.startPromiseLoop;
