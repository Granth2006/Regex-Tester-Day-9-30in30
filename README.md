<div align="center">

<img src="https://img.shields.io/badge/Day-9%20%2F%2030-7c3aed?style=for-the-badge&logo=calendar&logoColor=white" />
<img src="https://img.shields.io/badge/Regex-7c3aed?style=for-the-badge&logo=codepen&logoColor=white" />
<img src="https://img.shields.io/badge/DevTool-7c3aed?style=for-the-badge&logo=visualstudiocode&logoColor=white" />
<img src="https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white" />

<br /><br />

# ⚡ RegexLab

### A fast, interactive regex tester with real-time match highlighting, capture group inspection, pattern explanation, and a built-in replace tool — all in the browser.

<br/>

[![🚀 Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-RegexLab-7c3aed?style=for-the-badge)](https://regex-tester-30in30.vercel.app/)
&nbsp;&nbsp;
[![GitHub](https://img.shields.io/badge/⭐%20GitHub-Granth2006-24292e?style=for-the-badge&logo=github)](https://github.com/Granth2006)

</div>

---

## ⚙️ Features

<table>
  <tr>
    <td width="50%">
      <h3>🎯 Real-Time Match Highlighting</h3>
      Matches are highlighted live as you type, with colour-coded underlines for capture groups. Click any highlight to jump to that match.
    </td>
    <td width="50%">
      <h3>🧠 Pattern Explanation</h3>
      The app tokenises your regex and displays human-readable descriptions for each token — <code>\d</code> → digit, <code>+</code> → one or more, and more.
    </td>
  </tr>
  <tr>
    <td>
      <h3>🔁 Replace Tool</h3>
      Enter a replacement string (with <code>$1</code>, <code>$2</code> group references) and get a live preview. Hit "Replace All" to apply it instantly.
    </td>
    <td>
      <h3>🧪 Quick Presets</h3>
      One-click presets for Email, URL, Phone, Password, IPv4, Hex Color, Date, and HTML Tag patterns — perfect for learning or quick testing.
    </td>
  </tr>
  <tr>
    <td>
      <h3>🗂️ Match Details Panel</h3>
      Every match is listed with its index, start & end positions, and all captured groups shown with colour-coded labels.
    </td>
    <td>
      <h3>🔀 Single / All Mode</h3>
      Toggle between highlighting all matches at once or stepping through them one by one using Prev / Next navigation.
    </td>
  </tr>
</table>

---

## 🔐 Privacy First

> **Your data never leaves your device.**
> All regex matching, highlighting, and replacement runs entirely inside your browser using the native JavaScript `RegExp` engine. No input text or patterns are sent to any server.

---

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) | Structure & markup |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) | Styling — vanilla, no frameworks, dark theme with CSS custom properties |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) | All logic — regex engine, highlighting renderer, replace tool, presets |
| `Google Fonts` | JetBrains Mono (monospace) + Inter (UI) |
| ![Vercel](https://img.shields.io/badge/Vercel-000?style=flat&logo=vercel&logoColor=white) | Hosting & deployment |

---

## 📋 Project Info

| | |
|---|---|
| 🏆 **Challenge** | 30 Web Apps in 30 Days |
| 📅 **Day** | Day 9 / 30 |
| 👤 **Author** | Granth Kumar |
| 🌐 **Live URL** | [https://regex-tester-30in30.vercel.app/](https://regex-tester-30in30.vercel.app/) |
| 🛠️ **Build** | No build step — pure HTML / CSS / JS |
| 📄 **License** | MIT |

---

<details>
<summary>📁 File Structure</summary>

```
9/
├── index.html     # App layout — header, left input panel, right results panel
├── script.js      # Regex engine, match highlighting, navigation, presets, replace, copy utils
└── style.css      # Dark theme, CSS variables, card layout, match highlight styles, animations
```

</details>

---

<div align="center">

Built by **[Granth Kumar](https://github.com/Granth2006)** &nbsp;·&nbsp; Part of the **30 Web Apps in 30 Days** challenge

[![Live Demo](https://img.shields.io/badge/🚀%20Open%20Live%20Demo-7c3aed?style=for-the-badge)](https://regex-tester-day-9-30in30.vercel.app/)

</div>
