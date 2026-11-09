# knave-lang.org

The website of [Knave](https://github.com/knave-lang/knave), built by a generator written in Knave.

Run `direnv allow` once to load the [Nix](https://nixos.org/download/) dev shell, then use these commands:

```sh
knave build && target/knave/knave-site/knave-site
knave test .
knave fmt .
knave build && target/knave/knave-site/knave-site serve
```

`main.rslisp` at the repository root is a temporary symlink to `src/main.rslisp`, because `knave test` does not read `project.rslisp` yet. Knave needs an upstream fix for this.

**If the pinned Knave release reads `project.rslisp` in `knave test`, delete `main.rslisp`.** Then remove the `:entry` key from `project.rslisp` and the `src/` prefix from every `use`.
