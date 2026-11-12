# knave-lang.org

[![CI](https://github.com/knave-lang/knave-lang.org/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/knave-lang/knave-lang.org/actions/workflows/ci.yml)
[![Knave v0.14.21](https://img.shields.io/badge/knave-v0.14.21-blue.svg)](https://github.com/knave-lang/knave/releases/tag/v0.14.21)
[![Nix flake](https://img.shields.io/badge/nix-flake-5277C3.svg?logo=nixos&logoColor=white)](flake.nix)

The website of [Knave](https://github.com/knave-lang/knave), built by a generator written in Knave.

Run `direnv allow` once to load the [Nix](https://nixos.org/download/) dev shell, then use these commands:

```sh
knave task build
knave test
knave fmt
knave task serve
```
