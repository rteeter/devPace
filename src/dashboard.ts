import * as vscode from 'vscode';
import * as path from 'path';
import axios from 'axios';

interface Message {
    command: string;
    text: string[];
}

type EncouragementStyle = 'Cheerleader' | 'Supportive Friend' | 'Zen Master' |
    'Motivational Coach' | 'Inspiring Leader' | 'Friendly Colleague';

type BodyPart = 'Neck' | 'Upper back' | 'Lower back' |
    'Wrists' | "Mix";

export class Dashboard {
    private context: vscode.ExtensionContext;
    private timeoutId: NodeJS.Timeout | undefined;
    private config: vscode.WorkspaceConfiguration;
    private breakDuration: number;
    private userName: string;
    private workTime: number;
    private settings: vscode.WebviewPanel | null = null;
    private encouragementStyle: EncouragementStyle;
    private apiKey: string;
    private dashboard: vscode.WebviewPanel | null = null;

    constructor(extensionContext: vscode.ExtensionContext) {
        this.context = extensionContext;
        this.timeoutId = undefined;
        this.config = vscode.workspace.getConfiguration('devPace');
        this.breakDuration = Number(this.config.get('breakDuration', 10));
        this.userName = String(this.config.get('userName', 'Tech Wizard'));
        this.workTime = Number(this.config.get('workTime', 60));
        this.encouragementStyle = String(this.config.get('encouragementStyle', 'Supportive Friend')) as EncouragementStyle;
        this.apiKey = String(this.config.get('anthropicApiKey', ''));
        this.settings = null;
        this.checkApiKey();
        this.dashboard = null;
    }

    private checkApiKey(): void {
        if (!this.apiKey) {
            vscode.window.showWarningMessage(
                'Anthropic API key not set. Would you like to set it now?',
                'Open Settings',
                'Learn More'
            ).then(selection => {
                if (selection === 'Open Settings') {
                    vscode.commands.executeCommand('workbench.action.openSettings', 'devPace.anthropicApiKey');
                } else if (selection === 'Learn More') {
                    vscode.env.openExternal(vscode.Uri.parse('https://console.anthropic.com/'));
                }
            });
        }
    }

    private async generateEncouragement(): Promise<string> {
        try {
            console.log('Starting encouragement generation');
            console.log('Current style:', this.encouragementStyle);
            console.log('API Key exists:', Boolean(this.apiKey));

            if (!this.apiKey) {
                console.log('No API key found');
                this.checkApiKey();
                throw new Error('Anthropic API key not configured');
            }

            const stylePrompts: Record<EncouragementStyle, string> = {
                'Cheerleader': 'You are an enthusiastic cheerleader using peppy language, cheers, and spirit. Use emojis and cheerleader-style expressions.',
                'Supportive Friend': 'You are a warm, caring friend offering gentle encouragement and support. Use friendly, casual language.',
                'Zen Master': 'You are a calm, wise zen master offering peaceful wisdom. Use serene, mindful language.',
                'Motivational Coach': 'You are an energetic coach pushing for peak performance. Use strong, action-oriented language.',
                'Inspiring Leader': 'You are a visionary leader inspiring greatness. Use empowering, forward-thinking language.',
                'Friendly Colleague': 'You are a helpful coworker offering practical support. Use professional but friendly language.'
            };

            const prompt = stylePrompts[this.encouragementStyle];

            const response = await axios.post('https://api.anthropic.com/v1/messages', {
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
        } catch (error) {
            console.error('Error in generateEncouragement:', error);

            const fallbackMessages: Record<EncouragementStyle, string> = {
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

    private async generateRoutine(routineFocus: BodyPart): Promise<string> {
        try {
            console.log('Starting routine generation');
            console.log(`Movement focus: ${routineFocus}`);
            console.log('API Key exists:', Boolean(this.apiKey));

            if (!this.apiKey) {
                console.log('No API key found');
                this.checkApiKey();
                throw new Error('Anthropic API key not configured');
            }

            const commonPrompt = `You are speaking to ${this.userName}, a coder who is taking a movement break of ${this.breakDuration} minutes.
            In a numbered list of at most 5 items, suggest stretches and movements suitable for this amount of time.
            Give a time for each exercise, so that all times added together are equivalent to ${this.breakDuration} minutes. `;

            const bodyPrompts: Record<BodyPart, string> = {
                'Neck': commonPrompt + "Focus suggestions on the neck.",
                'Upper back': commonPrompt + "Focus suggestions on the upper back.",
                'Lower back': commonPrompt + "Focus suggestions on the lower back.",
                'Wrists': commonPrompt + "Focus suggestions on the wrists.",
                'Mix': commonPrompt + "Suggestions can be a mix of neck, back and wrist exercises."
            };

            const prompt = bodyPrompts[routineFocus];

            const response = await axios.post('https://api.anthropic.com/v1/messages', {
                model: 'claude-3-haiku-20240307',
                max_tokens: 300,
                messages: [{
                    role: 'user',
                    content: `${prompt} Keep it to 10 sentences maximum.`
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
        } catch (error) {
            console.error('Error in generateRoutine:', error);
            const commonIntro = `Here is a routine you can try, ${this.userName}.\n`
            const fallbackMessages: Record<BodyPart, string> = {
                'Neck': commonIntro + '\n' + `1. Neck Rolls: Sit or stand straight. Drop your chin to your chest and slowly roll your head in a full circle. Roll clockwise and then counterclockwise, repeating 3-5 times in each direction. Keep your shoulders relaxed and avoid hyperextending your neck backward.
                
                2. Side-to-Side Stretch: Tilt your head toward your right shoulder, bringing your ear closer to your shoulder (don’t raise your shoulder). Hold for 10-15 seconds, then switch to the left side. For a deeper stretch, gently place your hand on the side of your head.
                
                3. Forward and Backward Stretch: Tuck your chin toward your chest and hold for 5-10 seconds. Then tilt your head back, looking upward, and hold for 5-10 seconds. Repeat three times.
                
                4. Look Over Your Shoulder Stretch: Turn your head to look over your right shoulder and hold for 10-15 seconds. Return to center, then repeat on the left side. Do this 2-3 times per side.
                
                5. Shoulder and Neck Combo: Shrug your shoulders up toward your ears, hold for 2 seconds, and relax. Roll your shoulders backward in a circular motion five times, then forward five times. Let your arms hang naturally to finish.`,
                'Upper back': commonIntro + '\n' + `1. Seated Spinal Twist: Sit tall in your chair with feet flat on the ground. Place your right hand on the backrest or your left thigh and twist your upper body to the right, keeping your hips facing forward. Hold for 10-15 seconds, then switch sides. Repeat 2-3 times per side.
                
                2. Cat-Cow Stretch: Sit on the edge of your chair or stand with feet hip-width apart. Inhale as you arch your back, lifting your chest and looking slightly upward (cow pose). Exhale as you round your back, tucking your chin toward your chest and pulling your shoulder blades apart (cat pose). Repeat 5-7 times.
                
                3. Shoulder Blade Squeeze: Sit or stand upright. Pull your shoulder blades back and down, as if squeezing a pencil between them. Hold for 5 seconds, then release. Repeat 8-10 times.
                
                4. Forward Fold: Stand with feet shoulder-width apart. Hinge at the hips, allowing your arms to dangle toward the floor and your upper body to relax. Hold for 15-20 seconds, letting gravity release tension in your back. Slowly roll back up to standing.
                
                5. Wall Angels: Stand with your back flat against a wall, feet a few inches away from it. Press your lower back into the wall and raise your arms into a "goalpost" position. Slowly move your arms up and down, as if making a snow angel, keeping them in contact with the wall. Perform 8-10 repetitions.`,
                'Lower back': commonIntro + '\n' + `1. Seated Forward Fold: Sit at the edge of your chair with your feet flat on the floor. Hinge at your hips and slowly fold forward, letting your chest rest on your thighs and your hands dangle toward the floor. Hold for 15-20 seconds, then slowly return to an upright position. Repeat 2-3 times.
                
                2. Seated Spinal Twist: Sit tall in your chair with feet flat on the ground. Place your right hand on the backrest or your left thigh and twist your upper body to the right, keeping your lower back supported. Hold for 10-15 seconds, then switch sides. Repeat 2-3 times per side.
                
                3. Pelvic Tilts: Sit upright with your feet flat on the floor and hands resting on your thighs. Gently tilt your pelvis forward, arching your lower back, then tilt it backward, flattening your lower back against the chair. Repeat 10-12 times.
                
                4. Knee-to-Chest Stretch: Sit upright and lift your right knee toward your chest. Hold it with both hands, pulling it gently closer, and hold for 10-15 seconds. Lower your leg and repeat with the left knee. Perform 2-3 times per side.
                
                5. Standing Side Stretch: Stand with your feet shoulder-width apart. Raise your right arm overhead and gently lean to the left, keeping your hips stable. Hold for 10-15 seconds, return to center, then repeat on the other side. Perform 2-3 stretches per side.`,
                'Wrists': commonIntro + '\n' + `1. Wrist Circles: Extend your arms in front of you with your fists closed. Slowly rotate your wrists clockwise for 10-15 seconds, then counterclockwise for another 10-15 seconds. Repeat 2-3 times.
                
                2. Prayer Stretch: Bring your palms together in front of your chest with your elbows at the same height. Slowly lower your hands while keeping your palms pressed together until you feel a stretch in your wrists and forearms. Hold for 10-15 seconds and repeat 2-3 times.
                
                3. Reverse Prayer Stretch: Press the backs of your hands together at chest height with your fingers pointing downward. Gently push until you feel a stretch in the tops of your wrists. Hold for 10-15 seconds and repeat 2-3 times.
                
                4. Wrist Flexor Stretch: Extend your right arm forward with your palm facing up. Use your left hand to gently pull your fingers down and back toward your body. Hold for 10-15 seconds, then switch to the other side. Repeat 2-3 times per side.
                
                5. Wrist Extensor Stretch: Extend your right arm forward with your palm facing down. Use your left hand to gently pull your fingers back toward your body. Hold for 10-15 seconds, then switch to the other side. Repeat 2-3 times per side.`,
                'Mix': commonIntro + '\n' + `1. Neck Rolls: Sit or stand straight. Drop your chin to your chest and slowly roll your head in a full circle. Roll clockwise and then counterclockwise, repeating 3-5 times in each direction. Keep your shoulders relaxed.
                
                2. Wrist Circles: Extend your arms in front of you with your fists closed. Slowly rotate your wrists clockwise for 10-15 seconds, then counterclockwise for another 10-15 seconds. Repeat 2-3 times.
                
                3. Seated Spinal Twist: Sit tall in your chair with feet flat on the ground. Place your right hand on the backrest or your left thigh and twist your upper body to the right. Hold for 10-15 seconds, then switch sides. Repeat 2-3 times per side.
                
                4. Prayer Stretch: Bring your palms together in front of your chest with your elbows at the same height. Slowly lower your hands while keeping your palms pressed together until you feel a stretch in your wrists and forearms. Hold for 10-15 seconds and repeat 2-3 times.
                
                5. Cat-Cow Stretch: Sit on the edge of your chair or stand with feet hip-width apart. Inhale as you arch your back, lifting your chest and looking slightly upward (cow pose). Exhale as you round your back, tucking your chin toward your chest and pulling your shoulder blades apart (cat pose). Repeat 5-7 times.`
            };

            return fallbackMessages[routineFocus] || fallbackMessages['Mix'];;
        }
    }

    popUp = async () => {
        try {
            console.log('Starting popup creation');
            const encouragementMessage = await this.generateEncouragement();
            console.log('Encouragement received:', encouragementMessage);

            this.dashboard = vscode.window.createWebviewPanel(
                'paceDashboard',
                'devPace Dashboard',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'images')),
                        vscode.Uri.file(path.join(this.context.extensionPath, 'audio')) ]
                }
            );

            const imageUri = this.dashboard.webview.asWebviewUri(
                vscode.Uri.file(path.join(this.context.extensionPath, 'images', 'dalle-computer.png'))
            );

            const audioFile = this.dashboard.webview.asWebviewUri(
                vscode.Uri.file(path.join(this.context.extensionPath, 'audio', 'med-audio.mp3'))
            );

            const formDisposable2 = this.dashboard.webview.onDidReceiveMessage(async (message) => {
                const routineMessage = await this.generateRoutine(message.text);
                console.log('Routine received:', routineMessage);
                if (this.dashboard) {
                    const data = { message: routineMessage };
                    this.dashboard.webview.postMessage(data);
                }
                if (this.settings) {
                    this.settings.dispose();
                    this.context.subscriptions.push(formDisposable2);
                }
            });

            this.dashboard.webview.html = `<html>
                <body style="
                    color: white; 
                    margin: 0;
                    padding: 20px;
                    min-height: 100vh;
                    position: relative;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    ">
                    <div style="
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-image: url('${imageUri}');
                        background-size: cover;
                        background-position: center;
                        opacity: 0.6;
                        z-index: 0;
                        ">
                    </div>
                    <div style="
                        position: relative;
                        z-index: 1;
                        padding: 20px;
                        background-color: rgba(0, 0, 0, 0.7);
                        border-radius: 8px;
                        backdrop-filter: blur(3px);
                        ">
                        <h1 style="font-size: 24px; margin-bottom: 20px;">${encouragementMessage}</h1>
                        <p>How is your body feeling? I can recommend a movement routine. Let me know which area you would like to focus on or if you prefer a mix!</p>
                        <p>Be sure to click submit to get a suggestion.</p>
                        <style>
                            .radio-group {
                                display: flex;
                                gap: 10px;
                            }
                            label {
                                display: inline;
                            }
                            input[type="radio"] {
                                margin-right: 5px;
                            }
                            button {
                                display: block;
                                margin-top: 20px;
                                padding: 8px 16px;
                                background-color: #007acc;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                            }
                            button:hover {
                                background-color: #005999;
                            }
                        </style>
                        <form action="/submit" method="post" style="margin: 10px 0;">
                            <div class="radio-group">
                                <label>
                                    <input type="radio" name="bodyParts" value="Neck">
                                    Neck
                                </label>
                                <br>
                                <label>
                                    <input type="radio" name="bodyParts" value="Upper back">
                                    Upper back
                                </label>
                                <br>
                                <label>
                                    <input type="radio" name="bodyParts" value="Lower back">
                                    Lower back
                                </label>
                                <br>
                                <label>
                                    <input type="radio" name="bodyParts" value="Wrists">
                                    Wrists
                                </label>
                                <br>
                                <label>
                                    <input type="radio" name="bodyParts" value="Mix">
                                    Mix
                                </label>
                                <br>
                            </div>
                            <br>
                            <button id="submitButton" type="submit">Submit</button>
                        </form>                    
                        <p>Your break is set for ${this.breakDuration} minutes.</p>
                        <span id="timerText" style="font-size: 20px; font-weight: bold;"></span>
                        <p id="routine"></p<br>
                        <p> Music for Meditation</p>
                        <audio id='myMusic' controls preload='auto' loop>
                        <source src="${audioFile}" type="audio/mpeg">
                        </audio> 
                    </div>
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
                    document.getElementById('submitButton').addEventListener('click', () => {
                        event.preventDefault(); 
                        document.getElementById('submitButton').style.display = 'none';
                        var selected = document.querySelector('input[name="bodyParts"]:checked');
                        selected = selected ? selected.value : "Mix";
                        window.acquireVsCodeApi().postMessage({
                            command: 'submit', 
                            text: selected
                        });
                    })
                    window.addEventListener('message', event => {
                        const message = event.data;
                        console.log(message);
                        document.getElementById('routine').innerText = message.message;
                    });
                    </script>
                </body>
            </html>`;

            setTimeout(() => {
                //nested code gets executed only after this.breakDuration * 60 * 1000 has expired
                if (this.dashboard) {
                    this.dashboard.dispose();
                } this.timeoutId = setTimeout(() => {
                    vscode.commands.executeCommand('my-first-extension.popUp')
                }, this.workTime * 60 * 1000);
            }, this.breakDuration * 60 * 1000);

        } catch (error) {
            console.error('Error in popUp:', error);
            vscode.window.showErrorMessage('Error showing dashboard');
        }
    };

    //this does not cancel the first popup (I think); only subsequent popups
    pausePopUps = () => {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
        }
    };

    startPopUps = () => {
        if (!this.apiKey) {
            this.checkApiKey();
        }
        setTimeout(() => {
            vscode.commands.executeCommand('my-first-extension.popUp')
        }, this.workTime * 60 * 1000);
    };

    waitForMssg = (): Promise<Message> => {
        return new Promise((resolve, reject) => {
            const listener = (message: Message) => {
                if (message.command === 'submit') {
                    resolve(message);
                }
            }

            if (this.settings) {
                const formDisposable = this.settings.webview.onDidReceiveMessage(listener);
                this.context.subscriptions.push(formDisposable);
            }
        });
    };

    waitForUpdates = async () => {
        await this.config.update('userName', this.userName, vscode.ConfigurationTarget.Global);
        await this.config.update('workTime', this.workTime, vscode.ConfigurationTarget.Global);
        await this.config.update('breakDuration', this.breakDuration, vscode.ConfigurationTarget.Global);
        await this.config.update('encouragementStyle', this.encouragementStyle, vscode.ConfigurationTarget.Global);
        await this.config.update('configured', true, vscode.ConfigurationTarget.Global);
        this.checkApiKey();
    };

    updateSettings = () => {
        this.checkApiKey();
        this.settings = vscode.window.createWebviewPanel(
            'paceSettings',
            'devPace Settings',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'images'))]
            }
        );

        this.waitForMssg()
            .then((message) => {
                this.userName = message.text[0];
                this.workTime = Number(message.text[1]);
                this.breakDuration = Number(message.text[2]);
                this.encouragementStyle = message.text[3] as EncouragementStyle;
                this.waitForUpdates();
                vscode.window.showInformationMessage(`devPace preferences updated. Have a good day, ${this.userName}!`);
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
                <input type="number" step="1" id="workTime" />
                <br></br>
                <label for="breakDuration">How long do you want your breaks to be (in minutes)?</label>
                <input type="number" step="1" id="breakDuration" />
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
            <p id="feedback"></p>
            <p>You can always adjust these settings later by calling the command updateSettings.</p>
            <script> 
                document.getElementById('submitButton').addEventListener('click', () => {
                    const nameInput = document.getElementById('userName').value;
                    const workInput = document.getElementById('workTime').value;
                    const breakInput = document.getElementById('breakDuration').value;
                    const styleInput = document.getElementById('encouragementStyle').value;
                    const feedback = document.getElementById('feedback');
                    feedback.textContent = '';
                    if (!Number.isInteger(Number(workInput)) || workInput.trim() === "" || Number(workInput) < 1){
                        event.preventDefault();
                        feedback.textContent = 'Please enter a valid integer for duration of work sessions.';
                        feedback.style.color = 'red';
                    } else if (!Number.isInteger(Number(breakInput)) || breakInput.trim() === "" || Number(breakInput) < 1){
                        event.preventDefault();
                        feedback.textContent = 'Please enter a valid integer for duration of breaks.';
                        feedback.style.color = 'red';
                    } else if (nameInput.trim() === "") {
                        event.preventDefault();
                        feedback.textContent = 'Please enter a username.';
                        feedback.style.color = 'red';
                    } else {
                        window.acquireVsCodeApi().postMessage({
                            command: 'submit', 
                            text: [nameInput, workInput, breakInput, styleInput]
                        });
                    }
                }) 
            </script>
        </body></html>`;
    };

}
