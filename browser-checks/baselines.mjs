import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { chromium, firefox, webkit } from "playwright";

class StaticServer {
  static #CONTENT_TYPES = {
    ".css": "text/css",
    ".html": "text/html",
    ".js": "text/javascript",
    ".woff2": "font/woff2",
  };

  #root;
  #server;

  constructor(root) {
    this.#root = root;
    this.#server = createServer((request, response) => this.#serve(request, response));
  }

  async start() {
    await new Promise((resolve) => this.#server.listen(0, "127.0.0.1", resolve));
    return `http://127.0.0.1:${this.#server.address().port}`;
  }

  stop() {
    this.#server.close();
  }

  #serve(request, response) {
    const file = this.#fileFor(new URL(request.url, "http://localhost").pathname);
    if (!file) {
      response.writeHead(404).end();
      return;
    }
    const contentType = StaticServer.#CONTENT_TYPES[extname(file)] ?? "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType });
    createReadStream(file).pipe(response);
  }

  #fileFor(pathname) {
    const path = join(this.#root, normalize(pathname));
    const candidate = pathname.endsWith("/") ? join(path, "index.html") : path;
    return statSync(candidate, { throwIfNoEntry: false })?.isFile() ? candidate : null;
  }
}

class BaselineProbe {
  static measure() {
    const root = document.documentElement;
    const bodyFontSize = getComputedStyle(root).fontSize;
    const expected = BaselineProbe.#lengthOf("var(--_grid-baseline-offset)");
    return [...document.querySelectorAll("p")]
      .filter((paragraph) => getComputedStyle(paragraph).fontSize === bodyFontSize)
      .map((paragraph) => ({
        text: paragraph.textContent.trim().slice(0, 40),
        expected,
        actual: BaselineProbe.#baselineBelowLineTop(paragraph),
      }));
  }

  static #lengthOf(value) {
    const probe = document.createElement("div");
    probe.style.height = value;
    document.body.append(probe);
    const length = probe.getBoundingClientRect().height;
    probe.remove();
    return length;
  }

  static #baselineBelowLineTop(paragraph) {
    const style = getComputedStyle(paragraph);
    const marker = document.createElement("span");
    marker.style.cssText = "display: inline-block; width: 0; height: 0; vertical-align: baseline";
    paragraph.prepend(marker);
    const contentTop = paragraph.getBoundingClientRect().top
      + parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop);
    const baseline = marker.getBoundingClientRect().top - contentTop;
    marker.remove();
    return baseline;
  }
}

class BaselineCheck {
  static #BROWSERS = { chromium, firefox, webkit };
  static #PAGES = ["/", "/install/"];
  static #VIEWPORT = { width: 1280, height: 800 };
  static #TOLERANCE_PX = 0.5;

  #siteDirectory;
  #browserNames;

  constructor(siteDirectory, browserNames) {
    this.#siteDirectory = siteDirectory;
    this.#browserNames = browserNames;
  }

  async run() {
    const server = new StaticServer(this.#siteDirectory);
    const origin = await server.start();
    try {
      const results = [];
      for (const name of this.#browserNames) results.push(...await this.#checkBrowser(name, origin));
      return this.#report(results);
    } finally {
      server.stop();
    }
  }

  async #checkBrowser(name, origin) {
    const browser = await BaselineCheck.#BROWSERS[name].launch();
    try {
      const page = await browser.newPage({ viewport: BaselineCheck.#VIEWPORT });
      const results = [];
      for (const path of BaselineCheck.#PAGES) {
        await page.goto(origin + path);
        await page.evaluate(() => document.fonts.ready);
        const measurements = await page.evaluate(`(${BaselineProbe.toString()}).measure()`);
        results.push(...measurements.map((measurement) => ({ browser: name, path, ...measurement })));
      }
      return results;
    } finally {
      await browser.close();
    }
  }

  #report(results) {
    const misplaced = results.filter((result) => !BaselineCheck.#onGrid(result));
    for (const result of results) {
      const status = BaselineCheck.#onGrid(result) ? "ok  " : "FAIL";
      console.log(`${status} ${result.browser} ${result.path} baseline ${result.actual}px, expected ${result.expected}px: ${result.text}`);
    }
    console.log(`${results.length - misplaced.length} on the grid, ${misplaced.length} off it`);
    return results.length > 0 && misplaced.length === 0;
  }

  static #onGrid(result) {
    return Math.abs(result.actual - result.expected) < BaselineCheck.#TOLERANCE_PX;
  }
}

const [siteDirectory, ...browserNames] = process.argv.slice(2);
const passed = await new BaselineCheck(siteDirectory, browserNames).run();
process.exit(passed ? 0 : 1);
