import { startPromiseLoop, overWritePromise } from "utils";
import { deleteOldCreepMemory, memhack } from "wrappers";

overWritePromise();

export const loop = memhack(() => {
  deleteOldCreepMemory();
  // Bot code here

  doSomeStuffLater();

  startPromiseLoop();
});

const doSomeStuffLater = async () => {
  console.log("This will be done in the async queue");
  const myPromise = new Promise((resolve, reject) => {
    console.log("You can create new promises - they will be put on the queue automatically");
    if (Math.random() > 0.5) {
      resolve(5);
    } else {
      reject("error");
    }
  })
    .then(data => {
      console.log(`Then works: ${data}`);
    })
    .catch(err => {
      console.log(`Catch also works: ${err}`);
    });

  // And you can await promises as usual
  await myPromise;
};
