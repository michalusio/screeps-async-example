import { asyncify, FunctionKey } from "./util";

const asynced: readonly FunctionKey<Creep>[] = [
  "attack",
  "attackController",
  "build",
  "cancelOrder",
  "claimController",
  "dismantle",
  "drop",
  "generateSafeMode",
  "harvest",
  "heal",
  "move",
  "moveByPath",
  "moveTo",
  "notifyWhenAttacked",
  "pickup",
  "pull",
  "rangedAttack",
  "rangedHeal",
  "rangedMassAttack",
  "repair",
  "reserveController",
  "signController",
  "suicide",
  "transfer",
  "upgradeController",
  "withdraw"
] as const;

export const AsyncCreep = asyncify<Creep>(asynced);
