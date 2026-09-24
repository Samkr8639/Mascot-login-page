# 🎭 Animated Mascot Login Page

[![Angular](https://img.shields.io/badge/Angular-22-dd0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

A modern, highly interactive **Angular 22** login experience featuring a 3D animated mascot companion that reacts in real-time to user form actions (input focus, password entry, submission, errors, and success).

![Animated Mascot Login Page Preview](preview.png)

---

## 🏷️ Recommended GitHub Repository Topics

Copy and paste these tags into your GitHub repository settings under **About ⚙️ ➔ Topics**:

```text
angular angular22 login-page interactive-ui 3d-character mascot video-animation angular-signals typescript frontend glassmorphism ux-design web-animation
```

---

## ✨ Features

- **🎭 Reactive 3D Character Companion:**
  - **Idle (`idle`):** Friendly mascot breathing & ambient animation.
  - **Email Focus (`email-focus`):** Mascot watches attentively as you type your email.
  - **Password Focus (`password-focus`):** Mascot covers its eyes / looks away to respect privacy.
  - **Submitting (`loading`):** Mascot transitions to a verifying animation.
  - **Success (`success`):** Mascot celebrates upon successful authentication.
  - **Error (`error`):** Mascot enters a sticky error loop on invalid credentials.

- **⚡ Zero-Latency Video Engine:**
  - Dual HTML5 Video DOM elements (`videoA` / `videoB`) crossfading via `requestAnimationFrame`.
  - In-RAM preloading of critical state assets (`loading`, `success`) via Blob URLs for instantaneous transitions without decoder delay.

- **🚦 Modern Angular 22 Architecture:**
  - **Signals State Engine:** Built with `signal()`, `computed()`, and reactive signal bindings.
  - **Control Flow:** Utilizes `@switch` and `@if` template directives.
  - **Clean Reactive Subtitles:** Auto-updating status subtitle driven by form state.
  - **RxJS Safety:** Automatic lifecycle unsubscription via `takeUntilDestroyed()`.

- **🎨 Premium Visual & UI Design:**
  - 55/45 split layout (Full-bleed mascot panel + glassmorphism login card).
  - High-accessibility color palette (`#e2e9fd` background blend).
  - Custom password visibility toggle, checkbox, and error handling.

---

## 🛠 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Angular 22** | Core Web Framework (Standalone Components & Signals) |
| **TypeScript 6** | Strongly Typed Logic |
| **RxJS 7.8** | Async Data Streams & Unsubscription Utilities |
| **HTML5 Video APIs** | Multi-video crossfade engine |
| **CSS3 Design Tokens** | Custom properties, fluid layouts, & responsive media queries |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `>= v22.22.3` (or Node `v22.23.3`+)
- **npm**: `>= 10.0.0`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/login-page.git
   cd login-page
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   ng serve --open
   ```
   Navigate to `http://localhost:4200/`. The application will automatically reload if you change any source files.

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── login/
│   │   ├── character/
│   │   │   ├── character.component.ts    # Dual-video crossfade engine & Blob preloader
│   │   │   ├── character.component.html  # Video DOM elements (videoA / videoB)
│   │   │   └── character.component.css   # Character viewport styling
│   │   ├── auth.service.ts              # Mock authentication service
│   │   ├── login.component.ts            # Form Signals, validation, & state logic
│   │   ├── login.component.html          # Form markup & Angular control flow
│   │   └── login.component.css           # Split-screen responsive layout
│   ├── app.config.ts
│   └── app.ts
├── asset/                                 # Mascot MP4 video assets
└── styles.css                             # Global design system & theme variables
```

---

## 🧪 Building & Testing

- **Build for Production:**
  ```bash
  ng build
  ```
- **Run Unit Tests:**
  ```bash
  ng test
  ```

---

## 📜 License

Distributed under the MIT License.
