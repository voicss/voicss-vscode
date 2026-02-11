import type { UserConfig } from 'tsdown'

const isProd = process.argv.includes('--prod')

export default {
	alias: {
		'vscode-css-languageservice': 'vscode-css-languageservice/lib/esm/cssLanguageService.js',
		'jsonc-parser': 'jsonc-parser/lib/esm/main.js',
	},
	minify: isProd,
	sourcemap: isProd ? false : 'inline',
	fixedExtension: false,
	external: ['vscode'],
	noExternal: ['rawstyle', 'vscode-css-languageservice', 'vscode-languageserver-textdocument', '@vscode/emmet-helper'],
	inlineOnly: false,
} satisfies UserConfig