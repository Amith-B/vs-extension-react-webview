import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const provider = new ColorsViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ColorsViewProvider.viewType, provider)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('calicoColors.addColor', () => {
			provider.addColor();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('calicoColors.clearColors', () => {
			provider.clearColors();
		})
	);
}

class ColorsViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'calicoColors.colorsView';

	private _view?: vscode.WebviewView;

	constructor(private readonly _extensionUri: vscode.Uri) {}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [this._extensionUri],
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage((data) => {
			switch (data.type) {
				case 'colorSelected': {
					vscode.window.activeTextEditor?.insertSnippet(
						new vscode.SnippetString(`#${data.value}`)
					);
					break;
				}
			}
		});
	}

	public addColor() {
		if (this._view) {
			this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
			this._view.webview.postMessage({
				type: 'addColor',
				data: 'text from extension',
			});
		}
	}

	public clearColors() {
		if (this._view) {
			this._view.webview.postMessage({ type: 'clearColors' });
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		// Do the same for the stylesheet.
		const favIcon = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, 'dist', 'favicon.ico')
		);
		const logo192 = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, 'dist', 'logo192.png')
		);
		const manifest = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, 'dist', '/manifest.json')
		);

		const main = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, 'dist/static/js', 'main.js')
		);

		const css = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, 'dist/static/css', 'main.css')
		);

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<link rel="icon" href="${favIcon}" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<meta name="theme-color" content="#000000" />
				<meta name="description" content="Web site created using create-react-app" />
				<link rel="apple-touch-icon" href="${logo192}" />
				<link rel="manifest" href="${manifest}" />
				<title>React App</title>
				<script defer="defer" src="${main}"></script>
				<link href="${css}" rel="stylesheet" />
			</head>
			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<div id="root"></div>
			</body>
		</html>
		`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
