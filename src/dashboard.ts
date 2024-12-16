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
            <p>How is your body feeling? Let me know which parts may feel tense.</p>
            <input type="text" id="userInput" placeholder="Type here!" />
            <br></br>
            <img src="${imageUri}" alt="Natural landscape">
    
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
            // Optional: Handle timeout (in case the message is not received in time)
        })
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
                this.config.update('userName', this.userName);
                this.config.update('workTime', this.workTime);
                this.config.update('breakTime', this.breakDuration);
                this.config.update('configured', true);
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
