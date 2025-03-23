// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { command_password_generator_preset, command_password_entropy } from './commands';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "secret-toolkit-vscode" is now active!');
	
	const disposableEntropy = vscode.commands.registerCommand('secret-toolkit-vscode.passwordEntropy', async () => {
		
		// let { entropy, rating } = await command_password_entropy();
		// vscode.window.showInformationMessage(`Secret-Toolkit: Password entropy: ${entropy} (${rating})`); //TODO: Make the secretToolkit thing a global variable

		await command_password_entropy();
	});


	const disposablePasswordGeneratorInsert = vscode.commands.registerCommand('secret-toolkit-vscode.passwordGeneratorInsert', async () => {
		
		let out: string = await command_password_generator_preset() ?? "";
		const editor = vscode.window.activeTextEditor;

		if (editor && out) {
			editor.edit(editBuilder => {
				editBuilder.insert(editor.selection.active, out);
			});
			vscode.window.showInformationMessage(`Secret-Toolkit: Password inserted`); //TODO: Make the secretToolkit thing a global variable
		}	
	});

	const disposablePasswordGeneratorCopy = vscode.commands.registerCommand('secret-toolkit-vscode.passwordGeneratorCopy', async () => {
		
		let out: string = await command_password_generator_preset() ?? "";

		if (out) {
			await vscode.env.clipboard.writeText(out);
			vscode.window.showInformationMessage(`Secret-Toolkit: Password copied to clipboard`); //TODO: Make the secretToolkit thing a global variable
		}
	});

	context.subscriptions.push(disposablePasswordGeneratorInsert);
	context.subscriptions.push(disposablePasswordGeneratorCopy);
	context.subscriptions.push(disposableEntropy);

	
}

// This method is called when your extension is deactivated
export function deactivate() {}
