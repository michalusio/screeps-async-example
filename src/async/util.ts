import { AsyncResult } from "utils/promise";

export type FunctionKey<T> = keyof {
  [P in keyof T as T[P] extends (...args: any[]) => any ? P : never]: any;
};

type AsyncReturn<T, K extends keyof T> = T[K] extends (...args: any[]) => any
  ? ReturnType<T[K]> extends boolean
    ? Promise<boolean>
    : AsyncResult<0, Exclude<ReturnType<T[K]>, OK>>
  : never;

export type AsyncObject<T, Keys extends FunctionKey<T>> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? K extends Keys
      ? (...args: Parameters<T[K]>) => AsyncReturn<T, K>
      : T[K]
    : T[K];
};

const doAction =
  <T>(spawn: T) =>
  async (actionName: keyof T, ...args: unknown[]) => {
    const code = (spawn[actionName] as any)(...args) as number;
    if (typeof code === "boolean") return code;
    if (code === 0) {
      return code;
    }
    throw code;
  };

export const asyncify =
  <T extends object>(keys: readonly FunctionKey<T>[]) =>
  (object: T): AsyncObject<T, typeof keys[number]> => {
    const boundDo = doAction(object);
    const boundActions: Record<string | symbol, unknown> = _.zipObject(
      keys.map(key => [key, boundDo.bind(undefined, key)])
    );
    return new Proxy(object, {
      get(target, p, receiver) {
        return boundActions[p] ?? Reflect.get(target, p, receiver);
      }
    }) as AsyncObject<T, typeof keys[number]>;
  };
