# MyScanApp

MyScanApp is a mobile application designed to simplify document scanning, metadata management, and file uploading. It provides an intuitive interface for capturing, organizing, and processing documents on the go.

## Features

1. **Document Scanning**: 
   - Utilize device camera to scan documents
   - Automatically process and enhance scanned images

2. **File Picking**:
   - Select existing images from device storage

3. **Metadata Management**:
   - Add and edit metadata for scanned documents
   - Customizable fields including:
     - Year
     - Name
     - Category
     - Subcategory
     - Amount
     - Additional options (e.g., "Nebenkosten")

4. **File Upload**:
   - Upload scanned documents with associated metadata to a server
   - Support for both mobile and web platforms

5. **Settings Management**:
   - Configurable upload URL
   - Theme selection (light/dark mode)

6. **Multi-platform Support**:
   - iOS and Android mobile apps
   - Web application support

## Prerequisites

To run and develop MyScanApp, you'll need:

1. Node.js (v12 or later)
2. npm (v6 or later) or Yarn
3. React Native development environment set up
4. Expo CLI
5. Xcode (for iOS development)
6. Android Studio (for Android development)

## Installation

1. Clone the repository:
   git clone https://github.com/yourusername/MyScanApp.git
README.md
Apply

2. Navigate to the project directory:
   cd MyScanApp

3. Install dependencies:
   npm install
or if you're using Yarn:
   yarn install

4. Start the development server:
   npx expo start

5. Follow the Expo CLI instructions to run the app on your desired platform (iOS simulator, Android emulator, or physical device).

## Configuration

- Update the `uploadUrl` in the settings to point to your server endpoint for file uploads.
- Modify the `catData`, `yearData`, and `personData` in `appData.js` to customize the metadata options.

## Usage

1. Launch the app on your device or emulator.
2. Use the "Scan File" button to capture a new document or "Pick File" to select an existing image.
3. Add metadata to the scanned/selected document using the form.
4. Upload the document with its metadata using the "Erfasse Doc" button.
5. Manage your settings in the Settings tab.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).