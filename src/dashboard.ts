import * as vscode from 'vscode';
import * as path from 'path';

interface Message {
    command: string;
    text: string[];
}

export class Dashboard {
    private context: vscode.ExtensionContext;
    private timeoutId: NodeJS.Timeout | undefined;
    private config: vscode.WorkspaceConfiguration;
    private breakDuration: number;
    private userName: string;
    private workTime: number;
    private settings: vscode.WebviewPanel | null = null;
    
    constructor(extensionContext:vscode.ExtensionContext) {
        this.context = extensionContext;
        this.timeoutId = undefined;
        this.config = vscode.workspace.getConfiguration('devPace');
        this.breakDuration = Number(this.config.get('breakDuration', 10));
        this.userName = String(this.config.get('userName', 'Tech Wizard'));
        this.workTime = Number(this.config.get('workTime', 60));
        this.settings = null;
    }
    
    popUp = () => {        
        const dashboard = vscode.window.createWebviewPanel(
            'paceDashboard', 
            'devPace Dashboard', 
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'images'))]
            } 
        );
    
        const imageUri = dashboard.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'images', 'dalle-landscape1.jpeg')));
    
        dashboard.webview.html = `<html><body>
            <h1>It's time to move around, ${this.userName}!</h1>
            <p>Your break is set for ${this.breakDuration} minutes.</p>
            <span id="timerText">Placeholder</span>
            <p>How is your body feeling? Let me know which parts may feel tense.</p>
            <input type="text" id="userInput" placeholder="Type here!" />
            <br></br>
            <img src="${imageUri}" alt="Natural landscape">
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
        </body></html>`;
        
        setTimeout(() => {
            //nested code gets executed only after this.breakDuration * 60 * 1000 has expired
            dashboard.dispose();
            this.timeoutId = setTimeout(() => {
                vscode.commands.executeCommand('my-first-extension.popUp')
            }, this.workTime * 60 * 1000);
        }, this.breakDuration * 60 * 1000);
    }

    //this does not cancel the first popup (I think); only subsequent popups
    pausePopUps = () => {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
        }
    }

    startPopUps = () => {
        setTimeout(() => {
            vscode.commands.executeCommand('my-first-extension.popUp')
        }, this.workTime * 60 * 1000);
    }

    waitForMssg = (): Promise<Message> => {
        return new Promise((resolve, reject) => {
            const listener = (message: Message) => {
                    if (message.command === 'submit') {
                      resolve(message);
                    }
                }
                
            if (this.settings){
                const formDisposable = this.settings.webview.onDidReceiveMessage(listener);
                this.context.subscriptions.push(formDisposable);
            }
        })
    }

    waitForUpdates = async () => {
        await this.config.update('userName', this.userName, vscode.ConfigurationTarget.Global);
        await this.config.update('workTime', this.workTime, vscode.ConfigurationTarget.Global);
        await this.config.update('breakDuration', this.breakDuration, vscode.ConfigurationTarget.Global);
        await this.config.update('configured', true, vscode.ConfigurationTarget.Global);
    }

    updateSettings = () => {
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
                this.waitForUpdates();
                vscode.window.showInformationMessage(`Pace preferences updated successfully. Have a good day, ${this.userName}!`);
                if (this.settings){
                    this.settings.dispose();
                }
                })
            .catch((error) => {
                vscode.window.showErrorMessage(error.message);
            })

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
            <button id="submitButton" type="button">Submit</button>
            </form>
            <p>You can always adjust these settings later by calling the command updateSettings.</p>
            <script> 
                document.getElementById('submitButton').addEventListener('click', () => {
                const nameInput = document.getElementById('userName').value;
                const workInput = document.getElementById('workTime').value;
                const breakInput = document.getElementById('breakDuration').value;
                window.acquireVsCodeApi().postMessage({command: 'submit', text: [nameInput, workInput, breakInput]});
            }) 
            </script>
        </body></html>`;
    } 
}
