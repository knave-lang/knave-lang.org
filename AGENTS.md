# knave-lang.org

**Run these commands in the dev shell, which `nix develop` enters:**

```sh
knave build && target/knave/knave-site/knave-site
knave test .
knave fmt .
knave build && target/knave/knave-site/knave-site serve
```

**Put tests in `tests/`, NEVER in `src/`.**

**`main.rslisp` at the repository root is a temporary symlink to `src/main.rslisp`:** `knave test` does not read `project.rslisp` yet. Knave needs an upstream fix.

**If the pinned Knave release reads `project.rslisp` in `knave test`, delete `main.rslisp`.** Then remove the `:entry` key from `project.rslisp` and the `src/` prefix from every `use`.
