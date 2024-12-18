"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dashboard = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios"));
class Dashboard {
    constructor(extensionContext) {
        this.settings = null;
        this.popUp = async () => {
            try {
                console.log('Starting popup creation');
                const encouragementMessage = await this.generateEncouragement();
                console.log('Encouragement received:', encouragementMessage);
                const dashboard = vscode.window.createWebviewPanel('paceDashboard', 'devPace Dashboard', vscode.ViewColumn.One, {
                    enableScripts: true,
                    localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'images'))]
                });
                const imageUri = dashboard.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'images', 'dalle-landscape1.jpeg')));
                dashboard.webview.html = `<html>
                <body style="color: white; background-color: #1e1e1e;">
                    <h1 style="font-size: 24px; margin-bottom: 20px;">${encouragementMessage}</h1>
                    <p>Your break is set for ${this.breakDuration} minutes.</p>
                    <span id="timerText">Placeholder</span>
                    <p>How is your body feeling? Let me know which parts may feel tense.</p>
                    <input type="text" id="userInput" placeholder="Type here!" style="margin: 10px 0; padding: 5px;"/>
                    <br></br>
                    <img src="${imageUri}" alt="Natural landscape" style="max-width: 100%; height: auto;">
                    <script>
                    window.onload = function(){
                        const timerText = document.getElementById('timerText');
                        let countdownValue = ${this.breakDuration} * 60;
                        const interval = setInterval(() => {
                            if (countdownValue >= 0) {
                                let minutes = Math.floor(countdownValue / 60);
                                let seconds = countdownValue % 60;
                                minutes = minutes < 10 ? '0' + minutes : minutes;
                                seconds = seconds < 10 ? '0' + seconds : seconds;
                                timerText.textContent = minutes + ":" + seconds;
                                countdownValue--;
                            } else {
                                clearInterval(interval);
                            }
                        }, 1000);
                    }
                    </script>
                </body>
            </html>`;
                setTimeout(() => {
                    //nested code gets executed only after this.breakDuration * 60 * 1000 has expired
                    dashboard.dispose();
                    this.timeoutId = setTimeout(() => {
                        vscode.commands.executeCommand('my-first-extension.popUp');
                    }, this.workTime * 60 * 1000);
                }, this.breakDuration * 60 * 1000);
            }
            catch (error) {
                console.error('Error in popUp:', error);
                vscode.window.showErrorMessage('Error showing dashboard');
            }
        };
        //this does not cancel the first popup (I think); only subsequent popups
        this.pausePopUps = () => {
            if (this.timeoutId !== null) {
                clearTimeout(this.timeoutId);
            }
        };
        this.startPopUps = () => {
            if (!this.apiKey) {
                this.checkApiKey();
            }
            setTimeout(() => {
                vscode.commands.executeCommand('my-first-extension.popUp');
            }, this.workTime * 60 * 1000);
        };
        this.waitForMssg = () => {
            return new Promise((resolve, reject) => {
                const listener = (message) => {
                    if (message.command === 'submit') {
                        resolve(message);
                    }
                };
                if (this.settings) {
                    const formDisposable = this.settings.webview.onDidReceiveMessage(listener);
                    this.context.subscriptions.push(formDisposable);
                }
            });
        };
        this.waitForUpdates = async () => {
            await this.config.update('userName', this.userName, vscode.ConfigurationTarget.Global);
            await this.config.update('workTime', this.workTime, vscode.ConfigurationTarget.Global);
            await this.config.update('breakDuration', this.breakDuration, vscode.ConfigurationTarget.Global);
            await this.config.update('encouragementStyle', this.encouragementStyle, vscode.ConfigurationTarget.Global);
            await this.config.update('configured', true, vscode.ConfigurationTarget.Global);
            this.checkApiKey();
        };
        this.updateSettings = () => {
            this.checkApiKey();
            this.settings = vscode.window.createWebviewPanel('paceSettings', 'devPace Settings', vscode.ViewColumn.One, {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'images'))]
            });
            this.waitForMssg()
                .then((message) => {
                this.userName = message.text[0];
                this.workTime = Number(message.text[1]);
                this.breakDuration = Number(message.text[2]);
                this.encouragementStyle = message.text[3];
                this.waitForUpdates();
                vscode.window.showInformationMessage(`Pace preferences updated successfully. Have a good day, ${this.userName}!`);
                if (this.settings) {
                    this.settings.dispose();
                }
            })
                .catch((error) => {
                vscode.window.showErrorMessage(error.message);
            });
            this.settings.webview.html = `<html><body>
            <h1>Hi there! Let's set your pace preferences. </h1>
            <form id="inputForm">
                <label for="userName">What is your name?</label>
                <input type="text" id="userName" />
                <br></br>
                <label for="workTime">How long do you want to work for without a break (in minutes)?</label>
                <input type="text" id="workTime" />
                <br></br>
                <label for="breakDuration">How long do you want your breaks to be (in minutes)?</label>
                <input type="text" id="breakDuration" />
                <br></br>
                <label for="encouragementStyle">What kind of encouragement would you like?</label>
                <select id="encouragementStyle">
                    <option value="Motivational Coach">Motivational Coach</option>
                    <option value="Friendly Colleague">Friendly Colleague</option>
                    <option value="Zen Master">Zen Master</option>
                    <option value="Cheerleader">Cheerleader</option>
                    <option value="Inspiring Leader">Inspiring Leader</option>
                    <option value="Supportive Friend">Supportive Friend</option>
                </select>
                <br></br>
                <button id="submitButton" type="button">Submit</button>
            </form>
            <p>You can always adjust these settings later by calling the command updateSettings.</p>
            <script> 
                document.getElementById('submitButton').addEventListener('click', () => {
                    const nameInput = document.getElementById('userName').value;
                    const workInput = document.getElementById('workTime').value;
                    const breakInput = document.getElementById('breakDuration').value;
                    const styleInput = document.getElementById('encouragementStyle').value;
                    window.acquireVsCodeApi().postMessage({
                        command: 'submit', 
                        text: [nameInput, workInput, breakInput, styleInput]
                    });
                }) 
            </script>
        </body></html>`;
        };
        this.context = extensionContext;
        this.timeoutId = undefined;
        this.config = vscode.workspace.getConfiguration('devPace');
        this.breakDuration = Number(this.config.get('breakDuration', 10));
        this.userName = String(this.config.get('userName', 'Tech Wizard'));
        this.workTime = Number(this.config.get('workTime', 60));
        this.encouragementStyle = String(this.config.get('encouragementStyle', 'Supportive Friend'));
        this.apiKey = String(this.config.get('anthropicApiKey', ''));
        this.settings = null;
        this.checkApiKey();
    }
    checkApiKey() {
        if (!this.apiKey) {
            vscode.window.showWarningMessage('Anthropic API key not set. Would you like to set it now?', 'Open Settings', 'Learn More').then(selection => {
                if (selection === 'Open Settings') {
                    vscode.commands.executeCommand('workbench.action.openSettings', 'devPace.anthropicApiKey');
                }
                else if (selection === 'Learn More') {
                    vscode.env.openExternal(vscode.Uri.parse('https://console.anthropic.com/'));
                }
            });
        }
    }
    async generateEncouragement() {
        try {
            console.log('Starting encouragement generation');
            console.log('Current style:', this.encouragementStyle);
            console.log('API Key exists:', Boolean(this.apiKey));
            if (!this.apiKey) {
                console.log('No API key found');
                this.checkApiKey();
                throw new Error('Anthropic API key not configured');
            }
            const stylePrompts = {
                'Cheerleader': 'You are an enthusiastic cheerleader using peppy language, cheers, and spirit. Use emojis and cheerleader-style expressions.',
                'Supportive Friend': 'You are a warm, caring friend offering gentle encouragement and support. Use friendly, casual language.',
                'Zen Master': 'You are a calm, wise zen master offering peaceful wisdom. Use serene, mindful language.',
                'Motivational Coach': 'You are an energetic coach pushing for peak performance. Use strong, action-oriented language.',
                'Inspiring Leader': 'You are a visionary leader inspiring greatness. Use empowering, forward-thinking language.',
                'Friendly Colleague': 'You are a helpful coworker offering practical support. Use professional but friendly language.'
            };
            const prompt = stylePrompts[this.encouragementStyle];
            const response = await axios_1.default.post('https://api.anthropic.com/v1/messages', {
                model: 'claude-3-haiku-20240307',
                max_tokens: 100,
                messages: [{
                        role: 'user',
                        content: `${prompt} Give a break-time encouragement message to ${this.userName}. Keep it to 2 sentences maximum.`
                    }]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                }
            });
            console.log('API Response received');
            return response.data.content[0].text;
        }
        catch (error) {
            console.error('Error in generateEncouragement:', error);
            const fallbackMessages = {
                'Cheerleader': `Ready? OK! ${this.userName}, it's time for an energizing break! Let's keep that spirit high! 📣`,
                'Supportive Friend': `Hey ${this.userName}, you've been working hard and deserve this moment to recharge. Take care of yourself! 💝`,
                'Zen Master': `${this.userName}, let peace flow through you as you take this mindful pause. Be present in this moment. 🍃`,
                'Motivational Coach': `Great work, ${this.userName}! Time to recharge those batteries for your next breakthrough! 💪`,
                'Inspiring Leader': `${this.userName}, taking strategic breaks is what sets champions apart. Let's optimize your performance! ⭐`,
                'Friendly Colleague': `Hey ${this.userName}, coffee break time! You're doing great, let's refresh and reset. ☕`
            };
            return fallbackMessages[this.encouragementStyle] || fallbackMessages['Supportive Friend'];
        }
    }
}
exports.Dashboard = Dashboard;
//# sourceMappingURL=dashboard.js.map