# Hoshizora 星空

A desktop anime streaming app built with Tauri and React.

## Features

- Clean, minimal interface
- Library management
- Quick episode switching
- Cross-platform support (Windows, macOS, Linux)

## Development

### Prerequisites

- Node.js (v20 or higher)
- Rust (latest stable)
- Platform-specific development dependencies:
  
  #### Windows
  - Windows 10/11
  - VS 2022 with C++ build tools
  
  #### macOS
  - Xcode Command Line Tools
  
  #### Linux
  ```bash
  sudo apt update
  sudo apt install libwebkit2gtk-4.0-dev \
      build-essential \
      curl \
      wget \
      file \
      libssl-dev \
      libgtk-3-dev \
      libayatana-appindicator3-dev \
      librsvg2-dev
  ```

### Getting Started

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/hoshizora.git
   cd hoshizora
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Run development environment
   ```bash
   npm run tauri dev
   ```

### Building

```bash
npm run tauri build
```

Built applications can be found in `src-tauri/target/release/bundle/`

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Tauri (Rust)
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Development Status

This project is in active development. Features and APIs may change.

## License

MIT License

---

Made with ❤️ by vel