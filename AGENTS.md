# knave-lang.org

**Run these commands in the dev shell, which `nix develop` enters:**

```sh
knave build && target/knave/knave-site/knave-site
knave test
knave fmt
knave build && target/knave/knave-site/knave-site serve
```

**Put tests in `tests/`, NEVER in `src/`.**

**Name each test module `<source module>-test`:** a module in `tests/` that shares a path with a module in `src/` hides the source module.
