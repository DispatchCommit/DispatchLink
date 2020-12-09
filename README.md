[![GPL-3.0 License][license-shield]][license-url] [![Appveyor Build][appveyor-shield]][appveyor-url]

<br />
<p align="center">
  <a href="https://github.com/DispatchCommit/dispatchlink">
    <img src="logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">DispatchLink</h3>
  <div align="center">
    <i>A custom fork of CrewLink</i>
    <div>
      <span>More settings</span>
      <span>-</span>
      <span>Vision matches hearing range</span>
      <span>-</span>
      <span>Improved UI</span>
    </div>
  </div>

  <p align="center">
    Free, open, Among Us proximity voice chat forked from:
    <a href="ottomated/CrewLink" target="_blank">ottomated/CrewLink</a>
    .
    <br />
    <a href="https://github.com/DispatchCommit/dispatchlink/issues">Report Bug</a>
    ·
    <a href="https://github.com/DispatchCommit/dispatchlink/issues">Request Feature</a>
    ·
    <a href="#installation"><b>INSTALLATION INSTRUCTIONS</b></a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
* [Installation](#installation)
* [Development](#development)
  * [Prerequisites](#prerequisites)
  * [Setup](#setup)
* [Contributing](#contributing)
* [License](#license)



<!-- ABOUT THE PROJECT -->
## About The Project

This project implements proximity voice chat in Among Us. Everyone in an Among Us lobby with this program running will be able to communicate over voice in-game, with no third-party programs required. Spatial audio ensures that you can only hear people close to you.

## Installation

Download the latest version from [releases](https://github.com/ottomated/CrewLink/releases) and run the `CrewLink-Setup-X.X.X.exe` file. You may get antivirus warnings, because this program hooks into the Among Us process to read game data.

If you can, you should use a private server by deploying [this repository](https://github.com/ottomated/CrewLink-server).

### Setup Instructions (click)

[![Setup Video](https://img.youtube.com/vi/_8F4f5iQEIc/0.jpg)](https://www.youtube.com/watch?v=_8F4f5iQEIc "CrewLink Setup Instructions")

## Development

You only need to follow the below instructions if you are trying to modify this software. Otherwise, please download the latest version from the [github releases](https://github.com/DispatchCommit/dispatchlink/releases).

Server code is located at [ottomated/CrewLink-server](https://github.com/ottomated/CrewLink-server). Please use a local server for development purposes.

### Prerequisites

You must have Python, Node.js, and Yarn installed

* [Python](https://www.python.org/downloads/)
* [node.js](https://nodejs.org/en/download/)
* [yarn](https://classic.yarnpkg.com/en/docs/install)
```sh
npm install yarn -g
```

### Setup

1. Clone the repo
```sh
git clone https://github.com/DispatchCommit/dispatchlink.git
cd CrewLink
```
2. Install NPM packages with yarn
```sh
yarn install
```
3. Copy iohook binaries
```sh
mkdir -p node_modules\iohook\builds\electron-v80-win32-x64\build\Release\
cp iohook\iohook.node node_modules\iohook\builds\electron-v80-win32-x64\build\Release\
cp iohook\uiohook.dll node_modules\iohook\builds\electron-v80-win32-x64\build\Release\
```
3. Run the project
```sh
yarn dev
```

<!-- CONTRIBUTING -->
## Contributing

Any contributions you make are greatly appreciated.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## License

Distributed under the GNU General Public License v3.0. See `LICENSE` for more information.


[license-shield]: https://img.shields.io/github/license/ottomated/CrewLink.svg?style=flat-square
[license-url]: https://github.com/ottomated/CrewLink-server/blob/master/LICENSE
[appveyor-shield]: https://img.shields.io/appveyor/build/DispatchCommit/dispatchlink
[appveyor-url]: https://ci.appveyor.com/project/DispatchCommit/dispatchlink
