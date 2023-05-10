import NodeEnvironment from "jest-environment-node";
import setupGlobals from "./setup-globals";
import { mockRoomPositionConstructor } from "./mocking";


class TestEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();
    setupGlobals(this.global);
    mockRoomPositionConstructor(this.global);
  }
}


export default TestEnvironment;
