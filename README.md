# DropTidy 🚀

A modern, cross-platform application built with Vite, React, TypeScript, and Tailwind CSS. Designed for seamless file management, metadata removal, and AI-powered enhancements. Available as both a web application and desktop app with Electron.

![DropTidy Banner](public/tidy-drop-banner.png)

## 🌟 Features

- ⚡ **Vite** – ultra-fast development
- 🎨 **Tailwind CSS** & **shadcn/ui** for beautiful UI
- 🛡 **Metadata Removal** from photos and videos
- 🤖 **AI-Powered** anonymization tools
- 🗂 **Smart File Organization**
- 📱 **Fully Responsive** design
- 🌙 **Dark Mode** support
- 🔍 **Type Safe** with TypeScript
- 🖥️ **Desktop & Web** with unified build system
- 🔄 **Cross-Platform** compatibility

## 📸 Screenshots

| Home Page | Upload and Clean Files |
|:---------:|:----------------------:|
| ![Home Page](public/screenshots/homepage.png) | ![Upload and Clean Files](public/screenshots/upload-clean.png) |

| File Organization | Dark Mode |
|:-----------------:|:---------:|
| ![File Organization](public/screenshots/organize-files.png) | ![Dark Mode](public/screenshots/dark-mode.png) |

> *Note: Screenshots are stored in `public/screenshots/`. Replace placeholder images with real app screenshots.*

## 🚀 Getting Started

### Prerequisites

Make sure you have:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Git](https://git-scm.com/)
- [npm](https://www.npmjs.com/)

### Installation Guide

1. **Clone the Repository**
   ```bash
   git clone <YOUR_GIT_URL>
   ```

2. **Navigate to the Project Directory**
   ```bash
   cd tidy-drop-ui
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

5. **Visit Your App**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🔧 Build and Deployment

1. **Create a Production Build**
   ```bash
   npm run build
   ```

2. **Deploy** the contents of the `/dist` folder to any static hosting platform (e.g., Vercel, Netlify, Render).

## 📚 Project Structure

```
tidy-drop-ui/
├── public/              # Static assets (screenshots, banners)
├── src/
│   ├── components/      # Reusable React components
│   ├── pages/           # App pages and views
│   ├── lib/             # Utilities and helpers
│   ├── hooks/           # Custom React hooks
│   ├── context/         # Global app contexts
│   └── styles/          # Global and component-specific styles
├── package.json         # Project metadata and scripts
└── ...config files
```

## 🛠️ Development Tools

- **Code Quality**
  - ESLint for linting
  - Prettier for formatting
- **Version Control**
  - Git & GitHub
- **Type Checking**
  - TypeScript

## 🔮 Planned Features

- 📦 Bulk metadata removal for entire folders
- 🖼️ AI-based face detection and anonymization (auto blur faces)
- ✍️ Manual face selection and blur adjustment
- 🗂️ Smart file categorization using AI
- ☁️ Optional cloud sync and backup
- 💬 Multilingual support (EN / SK)
- 🔒 Advanced security settings and privacy modes

## 🚀 Development & Deployment

### Web Development

```bash
# Start development server (web version)
npm run dev:web

# Build for web deployment
npm run build:web:unified
```

### Desktop Development

```bash
# Start development with Electron
npm run electron:dev

# Build Electron app
npm run build:electron
```

### Unified Build System

We use a robust unified build system to deploy DropTidy to both web and desktop platforms:

```bash
# Standard unified web build
npm run build:web:unified

# Build with advanced TypeScript fixes 
npm run build:web:unified:advanced

# Deploy to Netlify
npm run netlify:deploy
```

For more information, see:
- [Unified Web Build Guide](UNIFIED-WEB-BUILD.md)
- [Web Build Quick Guide](WEB-BUILD-QUICKGUIDE.md)
- [Definitive Netlify Deployment](DEFINITIVE-NETLIFY-DEPLOYMENT.md)

## 🛤 Roadmap

| Milestone | Status | Target Date |
|:----------|:-------|:------------|
| Basic Metadata Removal Tool | ✅ Completed | April 2025 |
| UI/UX Polish & Dark Mode | ✅ Completed | April 2025 |
| Cross-Platform Support (Web + Desktop) | ✅ Completed | May 2025 |
| AI Face Blurring | 🚧 In Progress | May 2025 |
| Bulk Folder Processing | 📝 Planned | May 2025 |
| Smart Auto-Sorting | 📝 Planned | June 2025 |

> *Roadmap is tentative and may change as the project evolves.*

## 🤝 Contributing

We welcome contributions to make TidyDrop UI even better!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to your branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## 💬 Support

If you have any questions, feel free to open an issue on GitHub.

---

Built with ❤️ by the TidyDrop Team.
