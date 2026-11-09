# knave-lang.org

The website of [Knave](https://github.com/knave-lang/knave), built by a generator written in Knave.

Run `direnv allow` once to load the [Nix](https://nixos.org/download/) dev shell, then use these commands:

```sh
knave build && target/knave/knave-site/knave-site
knave test src
knave fmt src tests content
python3 -m http.server -d public
```
