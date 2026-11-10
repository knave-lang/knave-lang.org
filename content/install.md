# Install Knave

Knave needs Rust 1.88 or later, because the compiler runs the `rustc` and `rustfmt` on your `PATH`.

## With Cargo

Install [Rust](https://www.rust-lang.org/tools/install), then build the compiler:

```sh
cargo install --locked knave
```

## With Nix

This installs the compiler with the `rustc` and `rustfmt` that its CI tests against:

```sh
nix profile install github:knave-lang/knave
```

## Start a project

Create a project and run it:

```sh
knave new hello
cd hello
knave run
```
