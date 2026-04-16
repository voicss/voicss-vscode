import { join } from 'node:path'
import type { ExtensionContext } from 'vscode'
import { LanguageClient, TransportKind, type LanguageClientOptions, type ServerOptions } from 'vscode-languageclient/node.js'

let client: LanguageClient | undefined

export const activate = (context: ExtensionContext) => {
	const clientOptions: LanguageClientOptions = { documentSelector: ['typescript', 'typescriptreact'] }

	const serverModule = context.asAbsolutePath(join('dist', 'server.js'))
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc },
	}

	client = new LanguageClient('voicss-language-server', 'Voicss Language Server', serverOptions, clientOptions)
	void client.start()
}

export const deactivate = () => client?.stop()