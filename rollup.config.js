"use strict";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import async from "./lib/rollup-plugin-async";
//import { terser } from "rollup-plugin-terser";
import location from "./location.json";

export default {
  input: "src/main.ts",
  output: {
    file: location,
    format: "cjs",
    sourcemap: true
  },

  plugins: [
    resolve({ rootDir: "src" }),
    commonjs(),
    //terser(),
    typescript({ tsconfig: "./tsconfig.json" }),
    async()
  ]
};
