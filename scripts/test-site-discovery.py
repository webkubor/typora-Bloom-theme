#!/usr/bin/env python3
"""Validate actual Pages output rather than a dev server's HTML fallback."""
import json
import re
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "_pages"
HOME = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["homepage"].rstrip("/") + "/"


class SiteDiscoveryTest(unittest.TestCase):
    def read_output(self, name):
        content = (OUT / name).read_text(encoding="utf-8")
        self.assertNotRegex(content.lower(), r"<!doctype\s+html|<html(?:\s|>)")
        return content

    def test_robots(self):
        content = self.read_output("robots.txt")
        self.assertRegex(content, r"(?im)^User-agent:\s*\*\s*$")
        self.assertRegex(content, r"(?im)^Allow:\s*/\s*$")
        self.assertIn(f"Sitemap: {HOME}sitemap.xml", content)

    def test_sitemap(self):
        root = ET.fromstring(self.read_output("sitemap.xml"))
        ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
        self.assertEqual(root.tag, ns + "urlset")
        self.assertEqual([element.text for element in root.findall(f"{ns}url/{ns}loc")], [HOME])

    def test_theme_stylesheets_resolve_font_files(self):
        stylesheets = sorted((OUT / "dist").glob("bloom-*.css"))
        self.assertEqual(len(stylesheets), 24)
        for stylesheet in stylesheets:
            content = stylesheet.read_text(encoding="utf-8")
            fonts = re.findall(r'url\(["\']([^"\']*bloom/fonts/[^"\']+)["\']\)', content)
            self.assertTrue(fonts, f"no fonts found in {stylesheet.name}")
            for font in fonts:
                self.assertTrue((stylesheet.parent / font).is_file(), f"missing {font} in {stylesheet.name}")
        # Website rewriting must not change the package's original CSS.
        self.assertIn('url("./bloom/fonts/', (ROOT / "dist/bloom-petal.css").read_text(encoding="utf-8"))

    def test_llms(self):
        content = self.read_output("llms.txt")
        self.assertRegex(content, r"(?m)^# Bloom for Typora\s*$")
        self.assertIn(HOME, content)
        self.assertIn("https://github.com/webkubor/typora-Bloom-theme", content)
        self.assertTrue(re.search(r"(?im)^> .+typora", content))


if __name__ == "__main__":
    unittest.main()
