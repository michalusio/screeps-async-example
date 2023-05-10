export function deleteOldCreepMemory() {
  for (var creepName in Memory.creeps) {
    if (!Game.creeps[creepName]) {
      delete Memory.creeps[creepName];
    }
  }
}
