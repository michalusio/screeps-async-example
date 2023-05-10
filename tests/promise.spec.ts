import { overWritePromise, startPromiseLoop } from "../src/utils/promise";

beforeEach(() => {
  overWritePromise();
});

describe("Promise", () => {
  describe("should resolve", () => {
    it("when then'ed", () => {
      expect.assertions(1);
      Promise.resolve(4).then(v => expect(v).toBe(4));
      startPromiseLoop();
    });

    it("when then'ed 2 times", () => {
      expect.assertions(1);
      Promise.resolve("a")
        .then(v => v + "b")
        .then(v => expect(v).toBe("ab"));
      startPromiseLoop();
    });
  });

  describe("should catch", () => {
    it("rejection", () => {
      expect.assertions(1);
      Promise.reject("a")
        .then(v => v + "b")
        .catch(v => v + "c")
        .then(v => expect(v).toBe("ac"));
      startPromiseLoop();
    });

    it("rejection and then", () => {
      expect.assertions(1);
      Promise.reject("a")
        .catch(v => v + "c")
        .then(v => v + "b")
        .then(v => expect(v).toBe("acb"));
      startPromiseLoop();
    });
  });

  it("should work with timeout", done => {
    expect.assertions(4);
    let x = 0;
    const p = new Promise(resolve => {
      x = 1;
      setTimeout(resolve, 100, 12);
    });
    p.then(v => {
      x = 2;
      expect(v).toBe(12);
    });
    expect(x).toBe(0);
    startPromiseLoop();
    expect(x).toBe(1);
    setTimeout(() => {
      startPromiseLoop();
      expect(x).toBe(2);
      done();
    }, 200);
  });

  describe("all", () => {
    it("should work with resolved promise", () => {
      expect.assertions(1);
      Promise.all([Promise.resolve(5)]).then(x => expect(x).toStrictEqual([5]));
      startPromiseLoop();
    });

    it("should work with two promises", () => {
      expect.assertions(1);
      Promise.all([Promise.resolve(5), Promise.resolve(15)]).then(x => expect(x).toStrictEqual([5, 15]));
      startPromiseLoop();
    });

    it("should work with timeouts", done => {
      let x = [0, 0];
      Promise.all([
        new Promise<number>(resolve => setTimeout(resolve, 200, 5)),
        new Promise<number>(resolve => setTimeout(resolve, 50, 15))
      ]).then(v => {
        x = v;
        expect(v).toStrictEqual([5, 15]);
      });
      setTimeout(() => {
        startPromiseLoop();
        done();
      }, 200);
    });
  });

  describe("race", () => {
    it("should work with resolved promise", () => {
      expect.assertions(1);
      Promise.race([Promise.resolve(5)]).then(x => expect(x).toBe(5));
      startPromiseLoop();
    });

    it("should work with two promises", () => {
      expect.assertions(1);
      Promise.race([Promise.resolve(5), Promise.resolve(15)]).then(x => expect(x).toBe(5));
      startPromiseLoop();
    });

    it("should work with timeouts", done => {
      expect.assertions(1);
      let x = 0;
      Promise.race([
        new Promise<number>(resolve => setTimeout(resolve, 200, 5)),
        new Promise<number>(resolve => setTimeout(resolve, 50, 15))
      ]).then(v => {
        x = v;
        expect(v).toBe(15);
      });
      setTimeout(() => {
        startPromiseLoop();
        done();
      }, 200);
    });
  });
});
