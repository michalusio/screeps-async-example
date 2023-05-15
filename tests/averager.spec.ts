import { Averager } from "../src/utils/average";

describe("Averager", () => {
  it.each([
    [[1], 1],
    [[1, 2], 1.5],
    [[1, 1, 1, 2], 5 / 4],
    [[20, 26], 23]
  ])("for %p returns %d", (data, result) => {
    const averager = Averager();
    data.forEach(averager.add);
    expect(averager.average()).toBe(result);
  });
});
