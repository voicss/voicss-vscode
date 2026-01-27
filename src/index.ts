import { window } from 'vscode'
import type { ExtensionContext } from 'vscode'

export function activate(context: ExtensionContext) {
	console.log('Rawstyle VS Code extension is active!')
	window.showInformationMessage('Rawstyle VS Code extension activated!')
	console.log('Extension context:', context)
}