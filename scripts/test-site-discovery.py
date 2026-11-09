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


def themes_from_list():
    """读取 scripts/theme-list.js —— 主题名的唯一真实来源。

    该文件是 CommonJS 的对象字面量（键名带引号），不是 JSON，
    所以这里用正则取 name 字段，而不是硬编码一份名单。
    """
    source = (ROOT / "scripts" / "theme-list.js").read_text(encoding="utf-8")
    return [{"name": name} for name in re.findall(r'name:\s*"([^"]+)"', source)]


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
        # 首页 + 两个可索引内容页。单页站只留 1 条 sitemap 等于把爬虫的抓取面掐死：
        # 用户搜到具体问题时也落不到对应页面。
        self.assertEqual(
            [element.text for element in root.findall(f"{ns}url/{ns}loc")],
            [HOME, f"{HOME}install.html", f"{HOME}palettes.html"],
        )

    def test_content_pages_are_indexable(self):
        """每个内容页必须自带独立 URL、canonical 与 description。

        少了 canonical，站内多个 URL 会被当成同一页；少了 description，
        搜索引擎只能自己猜这段内容是关于什么的。
        """
        for page in ("install.html", "palettes.html"):
            content = (OUT / page).read_text(encoding="utf-8")
            self.assertIn(f'<link rel="canonical" href="{HOME}{page}" />', content)
            self.assertRegex(content, r'(?i)<meta name="description"')
            self.assertRegex(content, r'(?i)<h1[^>]*>')
            self.assertIn("github.com/webkubor/typora-Bloom-theme", content)

    def test_install_page_matches_release_filenames(self):
        """安装页里的文件名必须和实际发布包一致。

        2026-11-09 实测：官网曾把浅色文件写成 `bloom-*-light.css`，
        而发布包里根本没有这种命名，用户照着做会找不到文件。
        """
        content = (OUT / "install.html").read_text(encoding="utf-8")
        self.assertNotIn("-light.css", content)
        released = sorted(p.name for p in (ROOT / "dist").glob("bloom-*.css"))
        self.assertTrue(released, "没有构建出主题 CSS")
        for name in released:
            self.assertIn(name, content, f"安装页缺少发布包里的 {name}")

    def test_install_page_lists_theme_folders(self):
        content = (OUT / "install.html").read_text(encoding="utf-8")
        self.assertIn("Library/Application Support/Typora/themes", content)
        self.assertIn("%APPDATA%", content)
        self.assertIn("~/.config/Typora/themes", content)
        self.assertIn("bloom/fonts/", content)

    def test_palettes_page_lists_every_theme(self):
        content = (OUT / "palettes.html").read_text(encoding="utf-8")
        names = [t["name"] for t in themes_from_list()]
        self.assertEqual(len(names), 24)
        for name in names:
            self.assertIn(f"bloom-{name}", content, f"配色页缺少 {name}")

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

    def test_llms_lists_install_path(self):
        content = self.read_output("llms.txt")
        self.assertIn("bloom-petal.css", content)
        self.assertIn("bloom-petal-dark.css", content)
        self.assertIn("Bloom-theme.zip", content)
        self.assertIn(f"{HOME}install.html", content)
        self.assertIn("https://github.com/webkubor/typora-Bloom-theme/releases/latest", content)


if __name__ == "__main__":
    unittest.main()
