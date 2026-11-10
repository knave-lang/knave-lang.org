# knave-lang.org

The website of [Knave](https://github.com/knave-lang/knave), built by a generator written in Knave.

Run `direnv allow` once to load the [Nix](https://nixos.org/download/) dev shell, then use these commands:

```sh
knave task build
knave test
knave fmt
knave task serve
```

To check that body text sits on the baseline grid in Chromium and Firefox, build the site, then run:

```sh
npm ci --prefix browser-checks
node browser-checks/baselines.mjs public chromium firefox
```

The dev shell provides both browsers. CI runs the same check in WebKit on macOS.
