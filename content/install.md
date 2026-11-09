# Install Knave

Knave needs Rust 1.88 or later, because the compiler runs the `rustc` and `rustfmt` on your `PATH`.

## With Cargo

Install [Rust](https://www.rust-lang.org/tools/install), then build the compiler:

```sh
cargo install --locked --profile dist knave
```

## With Nix

This installs the compiler with the `rustc` and `rustfmt` that its CI tests against:

```sh
nix profile install github:knave-lang/knave
```

To download a prebuilt binary instead of building it, run `cachix use rslisp` first.

## Run a program

Save this as `hello.rslisp`:

```lisp
(defn main ()
  (println (str "hello" " " "world")))
```

Then run it:

```sh
knave run hello.rslisp
```

Run `knave` alone to start the prompt, and `knave --help` to list the commands.
