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

Besides the program, `knave new` writes a starter test, a git repository, a GitHub workflow and an agent skill.
Pass `--skip-git`, `--skip-github` or `--skip-agent-skill` to leave out the git repository, the workflow or the skill.
