# Gravity Defied Web

**Gravity Defied** is a legendary mototrial racing mobile game. It was originally developed by Codebrew Software in 2004 for J2ME platform.

This is a web browser port of Gravity Defied, written in TypeScript using Vite as the build tool. The project includes all the features of the original game and runs directly in modern web browsers.

🎮 **Play online:**  
https://yurkagon.github.io/gravity-defied-web/

![Preview](preview.gif)

## About

This project is a browser-based port of the classic Gravity Defied game. It's built using:
- **TypeScript** - for type-safe code
- **JavaScript** - for runtime execution
- **Vite** - for fast development and building
- **HTML5 Canvas** - for rendering the game graphics

The project is based on the C++ & SDL2 port: [gravity_defied_cpp](https://github.com/rgimad/gravity_defied_cpp)

## Disclaimer

**This Project is not associated with Codebrew Software in any fashion. All rights to the original Gravity Defied, it's name, logotype, brand and all that stuff belong to Codebrew Software.**

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The game will be available at `http://localhost:3000`

### Build

Build the project for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview

Preview the production build:

```bash
npm preview
```

## Project Structure

```
gravity-defied-web/
├── src/              # Source code
│   ├── app.ts       # Main application entry point
│   ├── main.ts      # Application initialization
│   └── ...          # Game logic, canvas rendering, physics, etc.
├── index.html       # HTML entry point
├── vite.config.ts   # Vite configuration
└── package.json     # Dependencies and scripts
```

## Technologies

- **TypeScript** - Type-safe JavaScript
- **Vite** - Next generation frontend tooling
- **HTML5 Canvas** - 2D graphics rendering
- **ESLint** - Code linting

## Topics

`gravity-defied` `game` `mototrial` `racing` `browser-game` `typescript` `vite` `canvas` `web-game` `retro-game` `j2me-port`

## License

This project is licensed under the GNU General Public License v2.0 (GPL-2.0). See [LICENSE.md](LICENSE.md) for the full license text.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
