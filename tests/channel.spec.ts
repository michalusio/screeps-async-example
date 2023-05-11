import { Channel, isDone } from "../src/utils/channel";
import { overWritePromise, startPromiseLoop } from "../src/utils/promise";

beforeEach(() => {
  overWritePromise();
});

describe("Channel", () => {
  it("should send then receive", () => {
    expect.assertions(1);

    const channel = Channel<number>();

    channel.sender.send(4);

    channel.receiver.receive().then(v => expect(v).toBe(4));

    startPromiseLoop();
  }, 1);

  it("should send multiple and receive multiple", () => {
    expect.assertions(3);

    const channel = Channel<number>();

    channel.sender.send(1);
    channel.sender.send(2);
    channel.sender.send(3);

    channel.receiver.receive().then(v => expect(v).toBe(1));
    channel.receiver.receive().then(v => expect(v).toBe(2));
    channel.receiver.receive().then(v => expect(v).toBe(3));

    startPromiseLoop();
  }, 1);

  it("should send multiple and receive multiple out of order", () => {
    expect.assertions(3);

    const channel = Channel<number>();

    channel.receiver.receive().then(v => expect(v).toBe(1));
    channel.sender.send(1);
    channel.sender.send(2);
    channel.receiver.receive().then(v => expect(v).toBe(2));
    channel.receiver.receive().then(v => expect(v).toBe(3));
    channel.sender.send(3);

    startPromiseLoop();
  }, 1);

  it("should close", () => {
    expect.assertions(1);

    const channel = Channel<number>();

    channel.sender.close();

    channel.receiver.receive().then(v => expect(isDone(v)).toBeTruthy());

    startPromiseLoop();
  }, 1);

  it("should receive done multiple times", () => {
    expect.assertions(3);

    const channel = Channel<number>();

    channel.sender.close();

    channel.receiver.receive().then(v => expect(isDone(v)).toBeTruthy());
    channel.receiver.receive().then(v => expect(isDone(v)).toBeTruthy());
    channel.receiver.receive().then(v => expect(isDone(v)).toBeTruthy());

    startPromiseLoop();
  }, 1);

  it("should send then close", () => {
    expect.assertions(3);

    const channel = Channel<number>();

    channel.sender.send(1);
    channel.sender.send(5);

    channel.receiver.receive().then(v => expect(v).toBe(1));
    channel.receiver.receive().then(v => {
      expect(v).toBe(5);
      channel.sender.close();
    });
    channel.receiver.receive().then(v => expect(isDone(v)).toBeTruthy());

    startPromiseLoop();
  }, 1);
});
