# DropTidy - Remove Metadata from Images and Videos

A simple, clean application for removing metadata from images and videos to protect your privacy.

![DropTidy Screenshot](https://via.placeholder.com/800x450.png?text=DropTidy+Screenshot)

## Features

- 🖼️ **Image Metadata Removal** - Remove EXIF data from JPG/PNG images
- 🎥 **Video Metadata Removal** - Strip metadata from MP4/MOV videos  
- 🌐 **Cross-Platform** - Works in web browsers and as an Electron desktop app
- 🧹 **Simple Interface** - Drag & drop functionality with clean, minimal UI
- 🛡️ **Privacy Focus** - All processing happens locally, no uploads to servers

## Development

### Prerequisites

- Node.js 16+ and npm
- For Electron features: ExifTool and FFmpeg installed on your system

### Installation

```bash
# Clone the repository
git clone https://github.com/LuliBobo/tidy-drop-ui.git
cd tidy-drop-ui

# Install dependencies
npm install
```

### Running the Application

```bash
# Web Development Mode (browser only)
npm run dev

# Electron Development Mode
npm run electron:dev

# Build for production (both web and desktop)
npm run build

# Start Electron app with production build
npm start

# Package Electron desktop apps
npm run electron:build
```

### Branch Structure

- **main** - Stable production branch
- **local** - Testing branch for local development
- **net** - Production branch for web deployment

## Usage

1. **Upload Files**
   - Drag and drop images or videos into the drop zone
   - Or click "Select Files" to choose files using the file browser

2. **Process Files**
   - Click "Remove Metadata" to clean the files
   - Files are processed locally on your device

3. **Download**
   - Cleaned files will automatically download or be saved to your chosen location

## Project Structure

```
├── electron/               # Electron app files
│   ├── main.js             # Main process
│   └── preload.js          # Preload script
├── src/
│   ├── components/
│   │   └── Dropzone.tsx    # File upload component
│   ├── utils/
│   │   └── removeMetadata.ts  # Metadata removal utility
│   ├── App.tsx             # Main React component
│   └── main.tsx            # Entry point
├── index.html              # HTML template
├── electron-builder.yml    # Electron packaging config
└── package.json            # Project dependencies
```

## Technical Details

### Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Build System**: Vite
- **Desktop App**: Electron
- **Metadata Processing**: ExifTool (images), FFmpeg (videos)

### Security Features

- Content Security Policy (CSP) to prevent XSS attacks
- IPC validation to prevent unauthorized channel access
- Local processing of all files (no server uploads)

## License

MIT © 2025 DropTidy