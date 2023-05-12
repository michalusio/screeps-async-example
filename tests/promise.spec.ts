import { overWritePromise, startPromiseLoop } from "../src/utils/promise";

beforeEach(() => {
  overWritePromise();
});

describe("Promise", () => {
  it("throwing body should reject", () => {
    expect.assertions(1);
    new Promise(() => {
      throw 4;
    }).catch(v => expect(v).toBe(4));
    startPromiseLoop();
  });

  it("resolving after ending should throw", () => {
    expect.assertions(1);
    new Promise(resolve => {
      resolve(4);
      resolve(5);
    });

    try {
      startPromiseLoop();
    } catch (err) {
      expect(err).toBe(5);
    }
  });

  it("rejecting after ending should throw", () => {
    expect.assertions(1);
    new Promise((resolve, reject) => {
      resolve(4);
      reject(5);
    });

    try {
      startPromiseLoop();
    } catch (err) {
      expect(err).toBe(5);
    }
  });

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

    it("invalid then clause", () => {
      expect.assertions(1);
      Promise.resolve(1)
        .then(() => {
          throw 5;
        })
        .catch(v => expect(v).toBe(5));
      startPromiseLoop();
    });

    it("invalid catch clause", () => {
      expect.assertions(1);
      Promise.reject(1)
        .catch(() => {
          throw 5;
        })
        .catch(v => expect(v).toBe(5));
      startPromiseLoop();
    });
  });

  describe("finally", () => {
    it("should work directly", () => {
      expect.assertions(1);
      Promise.resolve(1).finally(() => expect(true).toBeTruthy());
      startPromiseLoop();
    });

    it("should work with then", () => {
      expect.assertions(1);
      Promise.resolve(1)
        .then(() => 3)
        .finally(() => expect(true).toBeTruthy());
      startPromiseLoop();
    });

    it("should work with catch", () => {
      expect.assertions(1);
      Promise.reject(1)
        .catch(() => 3)
        .finally(() => expect(true).toBeTruthy());
      startPromiseLoop();
    });

    it("should work with then and catch", () => {
      expect.assertions(1);
      Promise.resolve(1)
        .then(() => {
          throw 6;
        })
        .catch(() => 5)
        .finally(() => expect(true).toBeTruthy());
      startPromiseLoop();
    });
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

    it("should error on any error", () => {
      expect.assertions(1);
      Promise.all([Promise.resolve(5), Promise.reject(15)]).catch(x => expect(x).toBe(15));
      startPromiseLoop();
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

    it("should return either error or value (1)", () => {
      expect.assertions(1);
      Promise.race([Promise.resolve(5), Promise.reject(15)]).then(x => expect(x).toBe(5));
      startPromiseLoop();
    });

    it("should return either error or value (2)", () => {
      expect.assertions(1);
      Promise.race([Promise.reject(15), Promise.resolve(5)]).catch(x => expect(x).toBe(15));
      startPromiseLoop();
    });
  });
});
