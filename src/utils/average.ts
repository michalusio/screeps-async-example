export type Averager = Readonly<{
  add(value: number): void;
  average(): number;
}>;
export const Averager = (): Averager => {
  let total = 0;
  let count = 0;
  return {
    add: value => {
      total += value;
      count++;
    },
    average: () => total / (count || 1)
  };
};
