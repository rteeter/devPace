# DevPace

## Overview

**Project Summary**
DevPace is a VS Code extension that helps developers maintain a healthy work pace by providing scheduled breaks with personalized AI-generated encouragement messages and targeted movement routines. Using Claude AI, it generates custom encouragement in different styles and provides tailored exercise suggestions while playing calming meditation music to help developers take mindful breaks and maintain physical wellness while coding.

**Authors**
- Adriana Mendoza Leigh - [Email](avml@seas.upenn.edu) - [GitHub](https://github.com/adrianavml)
- Rachel Teeter - [Email](reteeter@seas.upenn.edu) - [GitHub](https://github.com/rteeter)
- Rebecca Keith - [Email](lrk145@seas.upenn.edu) - [GitHub](https://github.com/lark523)

## Usage

### Prerequisites
- Node.js and npm installed
- Visual Studio Code (version 1.96.0 or higher)
- Anthropic API key with credit

### Installation

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

4. Get your Anthropic API Key:
- Visit [Anthropic Console](https://console.anthropic.com/)
- Sign up or log in
- Go to 'API Keys' section
- Click 'Create Key'
- Copy your new API key
- Go to 'Billing section'
- Click 'Add funds'
- Enter the amount of credits you want to purchase

5. Add the API key to VS Code when prompted by the extension upon launching.

Update or delete the API key later if needed:
- Open VS Code
- Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) 
- Type "Preferences: Open User Settings (JSON)"
- Add this to your settings.json:
```json
{
    "devPace.anthropicApiKey": "your-api-key-here"
}
```

### Deployment

1. Run the extension:
- Press F5 in VS Code to start debugging
- A new VS Code window will open with the extension loaded
- The extension will prompt you to set your preferences

2. Configure your preferences:
- Enter your name for personalized messages
- Set work duration (minutes between breaks)
- Set break duration 
- Choose your preferred encouragement style:
  - Motivational Coach
  - Friendly Colleague
  - Zen Master
  - Cheerleader
  - Inspiring Leader
  - Supportive Friend
- Click Save

3. During breaks:
- Read your personalized encouragement message
- Listen to calming meditation music (can be controlled with audio player)
- Select an area for your movement routine:
  - Neck
  - Upper back
  - Lower back
  - Wrists
  - Mix of exercises
- Follow the AI-generated exercise suggestions
- Use the built-in timer to track your break
- Return to work when the break completes

4. Available Commands:
- `devPace.updateSettings`: Open settings panel
- `devPace.pausePopUps`: Pause break notifications
- `devPace.startPopUps`: Resume break notifications
- `devPace.popUp`: Manually trigger a break

### Features
- AI-generated encouragement messages
- Customizable work/break durations
- Targeted movement routines
- Built-in meditation music player
- Interactive break timer
- Dynamic ambient background

## Additional Information

### Tools Used
- [VS Code Extension API](https://code.visualstudio.com/api) - Extension development framework
- [Claude API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api) - AI text generation
- [TypeScript](https://www.typescriptlang.org/) - Programming language
- [Node.js](https://nodejs.org/) - Runtime environment
- [Axios](https://axios-http.com/) - HTTP client
- Meditation Music - Royalty-free audio for break periods

### Project Structure
```
devpace/
├── src/
│   ├── extension.ts
│   └── dashboard.ts
├── images/
│   └── dalle-computer.png
├── audio/
│   └── med-audio.mp3
├── package.json
└── README.md
```

### Known Issues
- Break timer continues even if VS Code is inactive
- Audio may not autoplay due to browser restrictions

### Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### Acknowledgments
- VS Code Extension documentation and samples
- Anthropic's Claude API documentation
- ChatGPT for hard-coded exercise suggestions (default suggestions when no Anthropic API key is provided)
- Royalty-free meditation music providers

### License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
