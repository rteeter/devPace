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
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "devpace" is now active!');
    const disposable = vscode.commands.registerCommand('devpace.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from devpace!');
    });
    context.subscriptions.push(disposable);
    let startupmenu = vscode.commands.registerCommand('devpace.start', () => {
        //Create and show the startup window
        const panel = vscode.window.createWebviewPanel('setupWindow', 'Setup', vscode.ViewColumn.One, {});
        panel.webview.html = getWebViewContent();
    });
    context.subscriptions.push(startupmenu);
    let testphrase = 'teststring';
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => messagePopUps(testphrase)));
}
function getWebViewContent() {
    return `<!DOCTYPE html>
	<html>
	<head>
		<style>
			img {
				height: 100px;
				width: 100px;
			}
			h1 {
				color: green;
				}

	</style>
	</head>
	<body>

	<h1> Inital setup </h1>
	<table>
		<tr>
			<td>
			<label for ="activity">Activity:</label>
			</td>
			<td>
			<label for ="startTime">Start Time:</label>
			</td>
			<td>
			<label for ="stopTime">Stop Time:</label>
			</td>
			<td>
			<label for ="interval">Interval:</label>
			</td>
		<tr>
			<td>
			<img src="/waterimage.jpg">
			</td>
			<td>
			<input type="text" id="fname" name="fname">
			</td>
			<td>
			<input type="text" id="fname" name="fname">
			</td>
			<td>
			<input type="text" id="fname" name="fname">
			</td>
		</tr>
		<tr>
			<td>
			<label for ="walk">walk:</label>
			</td>
			<td>
			<input type="number" id="reminderInterval" name="reminder">
			</td>
			<td>
			<input type="text" id="fname" name="fname">
			</td>
			<td>
			<input type="text" id="fname" name="fname">
			</td>
		</tr>
		<tr>
			<td>
			<label for="Drink">Drinks:</label>
			</td>
			<td>
			<input type="text" id="fname" name="fname">
			</td>
			<td>
			<input type="text" id="fname" name="fname">
			</td>
			<td>
			<input type="text" id="fname" name="fname">
			</td>
		</tr>
	</table>
	<br><br>
	<button onclick="saveSettings()">Submit</button>
	</body>
	</html>
	`;
}
const phrase = vscode.window.createTextEditorDecorationType({
    after: {
        margin: "0 0 0 3em",
        textDecoration: "none",
    },
    isWholeLine: true,
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
});
function messagePopUps(text) {
    if (vscode.window.activeTextEditor) {
        const editor = vscode.window.activeTextEditor;
        const decorationOptions = {
            range: new vscode.Range(editor.selection.start, editor.selection.end),
            renderOptions: {
                after: {
                    contentText: text,
                    fontWeight: "normal",
                    fontStyle: "normal",
                },
            },
        };
        editor.setDecorations(phrase, [decorationOptions]);
        setHideTimeout();
    }
}
function setHideTimeout() {
    setTimeout(() => {
        vscode.window.activeTextEditor.setDecorations(phrase, []);
    }, 3500);
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map