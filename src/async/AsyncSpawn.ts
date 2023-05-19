import { asyncify, FunctionKey } from "./util";

const asynced: readonly FunctionKey<StructureSpawn>[] = [
  "destroy",
  "isActive",
  "notifyWhenAttacked",
  "recycleCreep",
  "renewCreep",
  "spawnCreep"
] as const;

export const AsyncSpawn = asyncify<StructureSpawn>(asynced);
