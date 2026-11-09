# knave-lang.org

**Run these commands in the dev shell, which `nix develop` enters:**

```sh
knave build && target/knave/knave-site/knave-site
knave test src
knave fmt src tests content
python3 -m http.server -d public
```

**Put tests in `tests/`, NEVER in `src/`.**
