const fs = require('fs');
const path = require('path');
const themes = require('./theme-list');
const { themePreview } = require('./theme-vars');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'theme-src');
const assetsDir = path.join(root, 'website', 'assets');

// 生成 site.js 需要的配置对象
const themeConfig = {};
themes.forEach(theme => {
    const preview = themePreview(theme, srcDir);
    themeConfig[theme.name] = {
        name: theme.label, // site.js 使用 name, theme-list 使用 label
        accent: preview.accent,
        bg: preview.bg,
        text: preview.text,
        hue: theme.hue
    };
});

const defaultTheme = themes.find(t => t.default) || themes[0];

const fileContent = `// Auto-generated from scripts/theme-list.js
window.THEME_CONFIG = ${JSON.stringify(themeConfig, null, 2)};
window.THEME_DEFAULT = "${defaultTheme.name}";
`;

const rootAssetsDir = path.join(root, 'assets');
[assetsDir, rootAssetsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(path.join(dir, 'theme-data.js'), fileContent);
});
console.log('Successfully generated assets/theme-data.js');
