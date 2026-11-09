# knave-lang.org

**Run these commands in the dev shell, which `nix develop` enters:**

```sh
knave build && target/knave/knave-site/knave-site
knave test src
knave fmt src tests content
python3 -m http.server -d public
```

**Put tests in `tests/`, NEVER in `src/`.**

**`src/tests` is a temporary symlink to `tests/`:** `knave test` does not read `project.rslisp` yet, and Knave needs an upstream fix.

**If the pinned Knave release reads `project.rslisp` in `knave test`, delete `src/tests`.** Then replace `knave test src` with `knave test .` in this file, `README.md`, and `.github/workflows/ci.yml`.
