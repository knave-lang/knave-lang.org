import sys
from html.parser import HTMLParser
from pathlib import Path


class PageLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.hrefs = set()

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if "id" in attributes:
            self.ids.add(attributes["id"])
        if "href" in attributes:
            self.hrefs.add(attributes["href"])

    @classmethod
    def of(cls, page):
        links = cls()
        links.feed(page.read_text())
        return links


class SiteLinkChecker:
    def __init__(self, root):
        self.root = root
        self.pages = {page: PageLinks.of(page) for page in root.rglob("*.html")}

    def broken_links(self):
        return [
            f"{page.relative_to(self.root)}: {href}"
            for page, links in self.pages.items()
            for href in sorted(links.hrefs)
            if self.is_internal(href) and not self.resolves(page, href)
        ]

    @staticmethod
    def is_internal(href):
        return href.startswith(("/", "#"))

    def resolves(self, page, href):
        path, _, fragment = href.partition("#")
        target = self.target_file(path) if path else page
        return target.is_file() and (not fragment or fragment in self.pages[target].ids)

    def target_file(self, path):
        target = self.root / path.lstrip("/")
        return target / "index.html" if target.is_dir() else target


def main():
    broken = SiteLinkChecker(Path(sys.argv[1])).broken_links()
    print("\n".join(broken) or "All internal links resolve.")
    sys.exit(1 if broken else 0)


if __name__ == "__main__":
    main()
