type Unpack<T> = T extends [infer X] ? X : T;

function unpack<T>(value: T): Unpack<T> {
  return Array.isArray(value) && value.length === 1 ? value[0] : value;
}

/**
 * Turns a function with a callback as the last argument into a function returning a Promise
 */
export function promisify<A extends unknown[], X extends unknown[]>(
  functionWithCallback: (...args: [...A, (...args2: X) => void]) => void
): (...args: A) => Promise<Unpack<X>> {
  return (...args: A) =>
    new Promise<Unpack<X>>((resolve, reject) => {
      try {
        functionWithCallback(...args, (...a: X) => resolve(unpack(a)));
      } catch (err) {
        reject(err);
      }
    });
}
