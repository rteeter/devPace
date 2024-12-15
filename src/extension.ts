import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "devpace" is now active!');

	const disposable = vscode.commands.registerCommand('devpace.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from devpace!');
	});

	context.subscriptions.push(disposable);

	let startupmenu = vscode.commands.registerCommand('devpace.start', ()=> {
		//Create and show the startup window
		const panel = vscode.window.createWebviewPanel(
			'setupWindow',
			'Setup',
			vscode.ViewColumn.One,
			{}
		);

		panel.webview.html = getWebViewContent();

	});

	context.subscriptions.push(startupmenu);
	let testphrase: string ='teststring';

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


function messagePopUps(text: string) {
	if (vscode.window.activeTextEditor) {
	  const editor = vscode.window.activeTextEditor!;
  
		const decorationOptions: vscode.DecorationOptions = {
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
	  vscode.window.activeTextEditor!.setDecorations(phrase, []);
	}, 3500);
  }

// This method is called when your extension is deactivated
export function deactivate() {}
