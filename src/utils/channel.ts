const Done = Symbol("Channel Done");
export type Done = typeof Done;

export const isDone = (value: any): value is Done => value === Done;

export type Channel<T> = Readonly<{
  sender: Sender<T>;
  receiver: Receiver<T>;
}>;

export type Sender<T> = Readonly<{
  isDone: () => boolean;
  close: () => void;
  send: (message: T) => Promise<void | Done>;
}>;

export type Receiver<T> = Readonly<{
  isDone: () => boolean;
  close: () => void;
  receive: () => Promise<T | Done>;
}>;

export const Channel = <T>(): Channel<T> => {
  let done = false;

  const messages: [T, (value: void | Done) => void][] = [];

  const receiveAwaiters: ((value: T | Done) => void)[] = [];

  const isDone = () => done;
  const close = () => {
    done = true;
    receiveAwaiters.forEach(aw => aw(Done));
    messages.forEach(([_, aw]) => aw(Done));
    receiveAwaiters.length = 0;
    messages.length = 0;
  };

  return {
    sender: {
      isDone,
      close,
      send: (message: T) => {
        return new Promise(resolve => {
          if (isDone()) {
            resolve(Done);
          }
          if (receiveAwaiters.length > 0) {
            receiveAwaiters.shift()!(message);
            resolve();
          } else {
            messages.push([message, resolve]);
          }
        });
      }
    },
    receiver: {
      isDone,
      close,
      receive: () => {
        return new Promise(resolve => {
          if (isDone()) {
            resolve(Done);
          }
          if (messages.length > 0) {
            const [message, from] = messages.shift()!;
            from();
            resolve(message);
          } else {
            receiveAwaiters.push(resolve);
          }
        });
      }
    }
  };
};
