import { Averager } from "./average";

/**
 * Running - the promise is running and waiting for resolution
 * Resolved - the promise has been succesfully resolved and is caching the value
 * Rejected - the promise has resulted in an error and is caching the error
 * Waiting - the promise has been created and is waiting for execution
 * Suspended - the promise is waiting for another promise to finish
 */
type PromiseState = "Running" | "Resolved" | "Rejected" | "Waiting" | "Suspended";

class MyPromise<T> {
  private state: PromiseState = "Waiting";
  private data: T | unknown | undefined;

  private thens: MyPromise<unknown>[] = [];

  constructor(
    private body: (resolve: (value: T) => void, reject: (error: unknown) => void) => void,
    addToQueue: boolean = true
  ) {
    if (addToQueue) {
      promiseQueue.add(this);
    }
  }

  public static all<T>(promises: MyPromise<T>[]): MyPromise<T[]> {
    const promiseData: [MyPromise<T>, T | undefined][] = promises.map(p => [p, undefined]);
    return new MyPromise((resolve, reject) => {
      let done = 0;
      promiseData.forEach(([pr], i) =>
        pr
          .then(result => {
            promiseData[i][1] = result;
            done += 1;
            if (done === promiseData.length) {
              resolve(promiseData.map(p => p[1]!));
            }
          })
          .catch(err => reject(err))
      );
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
    const promise = new MyPromise((_, __) => {});
    promise.state = "Rejected";
    promise.data = err;
    return promise;
  }

  public static resolve<T>(value: T): MyPromise<T> {
    const promise = new MyPromise<T>((_, __) => {});
    promise.state = "Resolved";
    promise.data = value;
    return promise;
  }

  public then<V>(map: (value: T) => V): MyPromise<V> {
    const promise = new MyPromise<V>((resolve, reject) => {
      if (this.state === "Resolved") {
        try {
          resolve(map(this.data as T));
        } catch (err) {
          reject(err);
        }
      } else reject(this.data);
    }, false);
    if (this.state === "Rejected" || this.state === "Resolved") {
      promiseQueue.add(promise);
    } else {
      promise.state = "Suspended";
      this.thens.push(promise);
    }
    return promise;
  }

  public catch<V>(map: (error: unknown) => V): MyPromise<T | V> {
    const promise = new MyPromise<T | V>((resolve, reject) => {
      if (this.state === "Rejected") {
        try {
          resolve(map(this.data));
        } catch (err) {
          reject(err);
        }
      } else {
        resolve(this.data as T);
      }
    }, false);
    if (this.state === "Rejected" || this.state === "Resolved") {
      promiseQueue.add(promise);
    } else {
      promise.state = "Suspended";
      this.thens.push(promise);
    }
    return promise;
  }

  public finally(action: () => void): MyPromise<void> {
    const promise = new MyPromise<void>((resolve, __) => {
      try {
        action();
      } finally {
        resolve();
      }
    }, false);
    if (this.state === "Rejected" || this.state === "Resolved") {
      promiseQueue.add(promise);
    } else {
      promise.state = "Suspended";
      this.thens.push(promise);
    }
    return promise;
  }

  private runBody() {
    const setState = (state: "Resolved" | "Rejected") => (data: T | unknown) => {
      if (this.state === "Running") {
        this.state = state;
        this.data = data;
        promiseQueue.delete(this);
        this.thens.forEach(p => {
          p.state = "Waiting";
          promiseQueue.add(p);
        });
        if (this.state === "Rejected" && this.thens.length === 0) {
          console.info(`Uncatched promise: ${this.data}`);
        }
      } else throw data;
    };
    const resolveFunction: (value: T) => void = setState("Resolved");
    const rejectFunction: (error: unknown) => void = setState("Rejected");
    this.state = "Running";
    try {
      this.body(resolveFunction, rejectFunction);
    } catch (err) {
      rejectFunction(err);
    }
  }

  /**
   * Starts running the promises. Finishes only when all the promises have been finalized.
   */
  public static startPromiseLoop(): void {
    while (promiseQueue.size) {
      const promise = MyPromise.findWaitingPromise();
      if (!promise) break;

      const cpuBefore = Game.cpu.getUsed();

      promise.runBody();

      const cpuAfter = Game.cpu.getUsed();
      const cpuUsed = cpuAfter - cpuBefore;
      promiseAverageTime.add(cpuUsed);

      const cpuLeft = Game.cpu.limit - Game.cpu.getUsed();
      const cpuEstimate = promiseAverageTime.average() * 1.5;
      if (cpuLeft < cpuEstimate) break;
    }
  }

  public static findWaitingPromise(): MyPromise<unknown> | undefined {
    const entries = promiseQueue.values();
    let result = entries.next();
    while (!result.done) {
      if (result.value.state === "Waiting") return result.value;
      result = entries.next();
    }
    return undefined;
  }
}

export type AsyncResult<T, E> = Omit<Promise<T>, "catch"> & {
  catch<TResult = never>(
    onrejected?: ((reason: E) => TResult | PromiseLike<TResult>) | null | undefined
  ): Promise<T | TResult>;
};

const promiseQueue: Set<MyPromise<unknown>> = new Set<MyPromise<unknown>>();
const promiseAverageTime: Averager = Averager();

export const overWritePromise = () => (globalThis.Promise = MyPromise as any);
export const startPromiseLoop = MyPromise.startPromiseLoop;
export const hasPromisesInLoop = () => !!MyPromise.findWaitingPromise();
