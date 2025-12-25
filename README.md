# Bloom · Typora Theme

<p align="center">
  <a href="https://typora-bloom-theme.webkubor.online/">
    <img src="typora-bloom-theme/favicon.svg" alt="Bloom" width="120" />
  </a>
</p>

官网预览：<https://typora-bloom-theme.webkubor.online/>

Bloom（绽放 / 成长）是一套为**长期写作**而设计的 Typora 主题。
它包含四套主题：**Bloom Light（浅色）**、**Bloom Dark（深色）**、**Bloom Forest（森林绿）**与**Bloom Sea（深海蓝）**。

![浅色](https://raw.githubusercontent.com/webkubor/upic-images/main/uPic/2025/12/%E6%88%AA%E5%B1%8F2025-12-19%2016.36.49.png)

![深色](https://raw.githubusercontent.com/webkubor/upic-images/main/uPic/2025/12/%E6%88%AA%E5%B1%8F2025-12-19%2016.38.47.png)

![森林](https://raw.githubusercontent.com/webkubor/upic-images/main/uPic/2025/12/2yD1J7.png)

![深海](https://raw.githubusercontent.com/webkubor/upic-images/main/uPic/2025/12/%E6%88%AA%E5%B1%8F2025-12-19%2016.40.40.png)


它追求安静、克制与温柔的表达——  
不过度装饰，不喧宾夺主，  
让文字始终成为视线的中心。

Bloom 适合那些需要**长时间阅读、记录、思考**的人。

这个主题诞生的时间，正好是我成为父亲之后。  
我开始更加在意时间、陪伴，以及那些会被反复翻阅的文字。

希望 Bloom 能像它的名字一样，  
在合适的光线里，慢慢生长。


---

## 设计理念

Bloom 的设计灵感来自「一天的光」。

- 清晨的自然明亮  
- 夜晚的安静专注  

因此，它包含两套基础主题，并提供两种深色变体：

- **Bloom Light** —— 清晨  
  清晰、柔和、低对比，适合白天阅读与整理思路  

- **Bloom Dark** —— 夜晚  
  克制、沉稳、护眼，适合夜间长时间写作  

- **Bloom Forest** —— 森林  
  深色基底，强调色偏绿，氛围更沉静  

- **Bloom Sea** —— 深海  
  深色基底，强调色偏蓝，观感更清爽  

四套主题在排版、比例、节奏上保持一致，只改变光感与色彩氛围。

---

## 设计原则

Bloom 不是为了展示设计本身，而是为了陪伴写作。

它遵循以下原则：

1. **文字优先**
   所有设计都应为内容让路。
   主题不抢表达，不制造存在感，只负责让文字被更好地阅读。

2. **长期可用**
   Bloom 不追求第一眼的惊艳，
   而追求在数小时、数月、甚至数年使用后，依然愿意打开。

3. **克制而非贫乏**
   颜色、装饰与强调都被谨慎使用。
   不是因为不能多，而是因为不需要多。

4. **情绪稳定**
   不追逐流行配色，
   不制造刺激对比，
   让界面在白天与夜晚都保持平和。

5. **尊重时间**
   写作是一件缓慢的事。
   Bloom 相信，值得被记录的内容，也值得一个安静的界面。

Bloom 试图成为这样一种存在：
当你专注于文字时，几乎感觉不到它；
当你回头翻阅时，又庆幸它一直在那里。


## 颜色与视觉

- 使用**单一强调色（Accent）**贯穿全局  
- 避免高饱和与强对比，保证长时间观看不疲劳  
- 标题、引用、代码块均采用层级递进，而非跳色区分  

你只需要修改一个变量，即可让整套主题呈现新的气质。

🌤 Bloom Light（清晨）

```
--accent: #ff4d8d;
--accent-2: rgba(255, 77, 141, 0.14);
--selection: rgba(255, 77, 141, 0.22);

--bg: #fbfbfd;
--surface: #f2f3f7;

--text: #171a22;
--muted: rgba(23, 26, 34, 0.64);

--border: rgba(23, 26, 34, 0.12);
```
特点：
	•	不是纯白，有纸感
	•	对比不强，但清晰
	•	很适合白天整理、阅读

  
🌙 Bloom Dark（夜晚）
```
--accent: #ff4d8d;
--accent-2: rgba(255, 77, 141, 0.22);
--selection: rgba(255, 77, 141, 0.28);

--bg: #0b0f19;
--surface: #111827;

--text: rgba(245, 246, 250, 0.92);
--muted: rgba(245, 246, 250, 0.64);

--border: rgba(245, 246, 250, 0.14);
```
特点：
	•	非纯黑，护眼
	•	文本偏暖灰，不刺眼
	•	Accent 会“发光但不跳”

---

## 字体与排版

Bloom 不强制绑定字体，但在设计时遵循以下原则：

- 行距偏松，适合长段阅读  
- 标题不过度放大，避免“PPT 感”  
- 中文与英文混排保持节奏统一  
- 列表、引用、代码块保持视觉连续性  

它不是为“截图好看”而设计，而是为**每天都愿意用**。

---

## 图标与细节

- 图标风格简洁、线性、低存在感  
- UI 元素尽量退后，为内容让路  
- 所有装饰都服务于阅读，而非展示  

Bloom 希望你在使用时，**几乎感受不到主题本身的存在**。

---

## 安装方式

1. 打开 Typora  
2. 进入：**偏好设置 → 外观 → 打开主题文件夹**  
3. 将以下文件复制到主题文件夹中：

   - `bloom-light.css`  
   - `bloom-dark.css`  
   - `bloom-forest.css`  
   - `bloom-sea.css`  

4. 回到 Typora：**主题 → 选择 `Bloom Light` / `Bloom Dark` / `Bloom Forest` / `Bloom Sea`**

### 从 Releases 下载（推荐）

1. 进入本仓库的 **Releases** 页面
2. 下载最新的 `Bloom-theme.zip`
3. 解压后，将以下内容复制到 Typora 主题文件夹：

   - `bloom-light.css`
   - `bloom-dark.css`
   - `bloom-forest.css`
   - `bloom-sea.css`
   - `typora-bloom-theme/`（如存在）

---

## 在线预览
- **官方演示：** [https://typora-bloom-theme.netlify.app](https://typora-bloom-theme.netlify.app)
- **GitHub Pages：** 推送到 `main` 后会自动部署。

## 致谢

感谢所有使用、反馈与分享 Bloom 的人。

如果这个主题在某个清晨或夜晚  
让你愿意多写几行字，  
那它的意义就已经成立了。
