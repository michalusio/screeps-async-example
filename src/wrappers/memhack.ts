export function memhack(fn: () => void): () => void {
  let memory: Memory;
  let tick: number;

  return () => {
    if (tick && tick + 1 === Game.time && memory) {
      // Disabling the default memory deserialization by deleting the property
      delete (global as any).Memory;
      (Memory as any) = memory;
    } else {
      memory = Memory;
    }

    tick = Game.time;

    fn();

    // there are two ways of saving Memory with different advantages and disadvantages
    // 1. RawMemory.set(JSON.stringify(Memory));
    // + ability to use custom serialization method
    // - you have to pay for serialization
    // - unable to edit Memory via Memory watcher or console
    // 2. RawMemory._parsed = Memory;
    // - undocumented functionality, could get removed at any time
    // + the server will take care of serialization, it doesn't cost any CPU on your site
    // + maintain full functionality including Memory watcher and console
    (RawMemory as any)._parsed = Memory;
  };
}
