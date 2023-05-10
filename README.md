# Screeps Collab Bot

Screeps Collab Bot is a Screeps AI written in Typescript.

## Basic Usage

You will need:

- [Node.JS](https://nodejs.org/en/download) (12.x or newer)
- A Package Manager ([Yarn](https://yarnpkg.com/en/docs/getting-started)
- Rollup CLI (Optional, install via `npm install -g rollup`)

Download the latest source and extract it to a folder.

Open the folder in your terminal and run your package manager to install the required packages and TypeScript declaration files:

```bash
yarn
```

Fire up your preferred editor with typescript installed and you are good to go!

### Rollup and code upload

This bot uses rollup to compile your typescript and upload it to a screeps server.

Move or copy `location.sample.json` to `location.json` and edit it, changing the destination path to the path your screeps script file resides in.

Running `rollup -c` will compile your code and do a "dry run", preparing the code for upload but not actually pushing it. Running `rollup -c --environment DEST:main` will compile your code, and then upload it to a screeps server using the `main` config from `screeps.json`.

You can use `-cw` instead of `-c` to automatically re-run when your source code changes - for example, `rollup -cw --environment DEST:main` will automatically upload your code to the `main` configuration every time your code is changed.

Finally, there are also NPM scripts that serve as aliases for these commands in `package.json` for IDE integration. Running `npm run push-main` is equivalent to `rollup -c --environment DEST:main`, and `npm run watch-sim` is equivalent to `rollup -cw --dest sim`.

## Typings

The type definitions for Screeps come from [typed-screeps](https://github.com/screepers/typed-screeps). If you find a problem or have a suggestion, please open an issue there.
