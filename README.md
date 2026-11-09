# knave-lang.org

The website of [Knave](https://github.com/knave-lang/knave), built by a generator written in Knave.

Run `direnv allow` once to load the [Nix](https://nixos.org/download/) dev shell, then use these commands:

```sh
knave build && target/knave/knave-site/knave-site
knave test src
knave fmt src tests content
python3 -m http.server -d public
```

`src/tests` is a temporary symlink to `tests/`, because `knave test` does not read `project.rslisp` yet. Knave needs an upstream fix for this.

**If the pinned Knave release reads `project.rslisp` in `knave test`, delete `src/tests`.** Then replace `knave test src` with `knave test .` in this file, `AGENTS.md`, and `.github/workflows/ci.yml`.
