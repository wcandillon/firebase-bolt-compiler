# Firebase Bolt Compiler

[![CircleCI](https://circleci.com/gh/wcandillon/firebase-bolt-compiler.svg?style=svg)](https://circleci.com/gh/wcandillon/firebase-bolt-compiler)
[![npm](https://img.shields.io/npm/v/firebase-bolt-compiler.svg)](https://www.npmjs.com/package/firebase-bolt-compiler)

Compiles Firebase Bolt files to TypeScript, Flow, and more.

This package is a rewrite of [firebase-bolt-transpiler](https://github.com/fny/firebase-bolt-transpiler) in TypeScript. It uses the same AST types from the original [firebase-bolt](https://github.com/firebase/bolt) package providing more safety and flexibility to generate different code artifacts.

## Installation

```bash
yarn install firebase-bolt-compiler
```

## Usage

To generate TypeScript:

```bash
firebase-bolt-compiler < rules.bolt
```

To generate Flow:

```bash
firebase-bolt-compiler --flow < rules.bolt
```

## Example

Using the following `rules.bolt` file as an input:

```
path /users/{uid} is Users {
  read() { true }
  write() { isCurrentUser(uid) }
}

type Users extends User[] {}

type User {
  firstName: String;
  lastName: String;
}
```

Will generate the TypeScript code below:

```
type Users = { [key: string]: User };

export interface User {
    firstName: string;
    lastName: string;
}
```
