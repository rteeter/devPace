# DevPace - Your Mindful Coding Companion

DevPace is a VS Code extension that helps developers maintain a healthy work pace by providing scheduled breaks with personalized AI-generated encouragement messages and targeted movement routines.

## Features

- Customizable work and break durations
- AI-powered encouragement messages in different styles:
  - Motivational Coach
  - Friendly Colleague
  - Zen Master
  - Cheerleader
  - Inspiring Leader
  - Supportive Friend
- AI-generated movement routines tailored to:
  - Neck tension
  - Upper back
  - Lower back
  - Wrists
  - Mixed routines
- Interactive break timer
- Beautiful ambient background
- Body awareness prompts

## Installation and Setup

1. Clone the repository:
```bash
git clone git@github.com:rteeter/devPace.git
cd devPace
```

2. Install dependencies:
```bash
npm install
```

3. Compile the extension:
```bash
npm run compile
```

4. Run the extension in development mode:
- Press F5 in VS Code to start debugging
- A new VS Code window will open with the extension loaded
- The extension will prompt you to set your preferences on first launch

## Configuration Requirements

1. Get your Anthropic API Key:
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Sign up or log in
   - Go to 'API Keys' section
   - Click 'Create Key'
   - Copy your new API key
2. Add the API key to VS Code:
   - Open VS Code
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type "Preferences: Open User Settings (JSON)"
   - Add this to your settings.json:
   ```json
   {
       "devPace.anthropicApiKey": "your-api-key-here"
   }
   ```

## Extension Settings

This extension contributes the following settings:

* `devPace.userName`: Your name for personalized messages
* `devPace.workTime`: Duration of work sessions in minutes
* `devPace.breakDuration`: Duration of breaks in minutes
* `devPace.encouragementStyle`: Style of AI-generated encouragement messages
* `devPace.anthropicApiKey`: Anthropic API key for generating messages

## Commands

- `devPace.updateSettings`: Open settings panel to update preferences
- `devPace.pausePopUps`: Pause break notifications
- `devPace.startPopUps`: Resume break notifications
- `devPace.popUp`: Manually trigger a break

## Known Issues

- Break timer continues even if VS Code is inactive

## Release Notes

### 1.0.0

- Initial release
- AI-powered encouragement messages using Claude
- Customizable work/break durations
- Multiple encouragement styles
- Targeted movement routines
- Interactive break timer
- Dynamic background

## Development

1. Make changes to the code
2. Compile:
```bash
npm run compile
```
3. Press F5 to run the extension in debug mode

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

---

For more information about VS Code extension development, see:
* [VS Code Extension API](https://code.visualstudio.com/api)
* [Your First Extension](https://code.visualstudio.com/api/get-started/your-first-extension)

**Enjoy coding mindfully with DevPace!**
