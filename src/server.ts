import { getCSSLanguageService, type HoverSettings, type CompletionSettings, type Stylesheet } from 'vscode-css-languageservice'
import { TextDocument } from 'vscode-languageserver-textdocument'
import { CompletionList, ProposedFeatures, TextDocuments, TextDocumentSyncKind, createConnection } from 'vscode-languageserver/node'
import { doComplete as doEmmetComplete, type VSCodeEmmetConfig } from '@vscode/emmet-helper'

interface CssBlock { start: number, end: number }
interface CssSnapshot {
	blocks: CssBlock[]
	document: TextDocument
	stylesheet: Stylesheet
	version: number
}

const CSS_BLOCK = /^\s*?void `css\s(.*?)`/msg
const connection = createConnection(ProposedFeatures.all)
const documents = new TextDocuments(TextDocument)
const cssLS = getCSSLanguageService()
const snapshots = new Map<string, CssSnapshot>()

const hoverSettings: HoverSettings = {
	documentation: true,
	references: true,
}
const completionSettings: CompletionSettings = {
	completePropertyWithSemicolon: true,
	triggerPropertyValueCompletion: true,
}
const emmetConfig: VSCodeEmmetConfig = {
	showExpandedAbbreviation: 'always',
	showAbbreviationSuggestions: true,
	showSuggestionsAsSnippets: true,
}
cssLS.configure({
	completion: completionSettings,
	hover: hoverSettings,
})

connection.onInitialize(() => ({
	capabilities: {
		textDocumentSync: TextDocumentSyncKind.Incremental,
		hoverProvider: true,
		renameProvider: true,
		completionProvider: {
			resolveProvider: false,
			triggerCharacters: ['!', ':', ' ', '.', '#', '-', '@'],
		},
		colorProvider: true,
		documentHighlightProvider: true,
		foldingRangeProvider: true,
	},
}))

connection.onHover(params => {
	const doc = documents.get(params.textDocument.uri)
	if (!doc) return

	const snapshot = getSnapshot(doc)
	if (!snapshot || !containsOffset(snapshot.blocks, doc.offsetAt(params.position))) return

	return cssLS.doHover(snapshot.document, params.position, snapshot.stylesheet, hoverSettings)
})

connection.onCompletion(params => {
	const doc = documents.get(params.textDocument.uri)
	if (!doc) return

	const snapshot = getSnapshot(doc)
	if (!snapshot || !containsOffset(snapshot.blocks, doc.offsetAt(params.position))) return

	const cssCompletions = cssLS.doComplete(snapshot.document, params.position, snapshot.stylesheet, completionSettings)
	const emmetCompletions = doEmmetComplete(snapshot.document, params.position, 'css', emmetConfig)

	return mergeCompletionLists(emmetCompletions, cssCompletions)
})

connection.onDocumentColor(params => {
	const doc = documents.get(params.textDocument.uri)
	if (!doc) return

	const snapshot = getSnapshot(doc)
	if (!snapshot) return

	return cssLS.findDocumentColors(snapshot.document, snapshot.stylesheet)
})

connection.onColorPresentation(params => {
	const doc = documents.get(params.textDocument.uri)
	if (!doc) return

	const snapshot = getSnapshot(doc)
	if (!snapshot || !containsRange(snapshot.blocks, doc, params.range)) return

	return cssLS.getColorPresentations(
		snapshot.document,
		snapshot.stylesheet,
		params.color,
		params.range,
	)
})

connection.onFoldingRanges(params => {
	const doc = documents.get(params.textDocument.uri)
	if (!doc) return

	const snapshot = getSnapshot(doc)
	if (!snapshot) return

	return cssLS.getFoldingRanges(snapshot.document)
})

connection.onDocumentHighlight(params => {
	const doc = documents.get(params.textDocument.uri)
	if (!doc) return

	const snapshot = getSnapshot(doc)
	if (!snapshot || !containsOffset(snapshot.blocks, doc.offsetAt(params.position))) return

	return cssLS.findDocumentHighlights(snapshot.document, params.position, snapshot.stylesheet)
})

connection.onRenameRequest(params => {
	const doc = documents.get(params.textDocument.uri)
	if (!doc) return

	const snapshot = getSnapshot(doc)
	if (!snapshot || !containsOffset(snapshot.blocks, doc.offsetAt(params.position))) return

	return cssLS.doRename(snapshot.document, params.position, params.newName, snapshot.stylesheet)
})

documents.onDidOpen(e => refreshDiagnostics(e.document))
documents.onDidChangeContent(e => refreshDiagnostics(e.document))
documents.onDidClose(e => {
	snapshots.delete(e.document.uri)
	void connection.sendDiagnostics({ uri: e.document.uri, diagnostics: [] })
})
documents.listen(connection)
connection.listen()

function getSnapshot(document: TextDocument): CssSnapshot | undefined {
	const cached = snapshots.get(document.uri)
	if (cached?.version === document.version) return cached

	const blocks = findCssBlocks(document.getText())
	if (blocks.length === 0) {
		snapshots.delete(document.uri)
		return
	}

	const virtualDoc = TextDocument.create(document.uri, 'css', document.version, maskNonCssText(document.getText(), blocks))
	const snapshot: CssSnapshot = {
		blocks,
		document: virtualDoc,
		stylesheet: cssLS.parseStylesheet(virtualDoc),
		version: document.version,
	}

	snapshots.set(document.uri, snapshot)
	return snapshot
}

function findCssBlocks(text: string): CssBlock[] {
	return [...text.matchAll(CSS_BLOCK)].map(m => {
		const content = m[1]
		const end = m.index + m[0].length - 1
		const start = end - content.length
		return { start, end }
	})
}

function maskNonCssText(text: string, blocks: CssBlock[]): string {
	const masked = new Array<string>(text.length)

	for (let index = 0; index < text.length; index++) {
		const char = text[index]
		masked[index] = char === '\n' || char === '\r' ? char : ' '
	}

	for (const block of blocks) {
		for (let index = block.start; index < block.end; index++) {
			masked[index] = text[index]!
		}
	}

	return masked.join('')
}

function containsOffset(blocks: CssBlock[], offset: number): boolean {
	return blocks.some(block => offset >= block.start && offset <= block.end)
}

function containsRange(blocks: CssBlock[], document: TextDocument, range: { start: { line: number, character: number }, end: { line: number, character: number } }): boolean {
	const start = document.offsetAt(range.start)
	const end = document.offsetAt(range.end)
	return blocks.some(block => start >= block.start && end <= block.end)
}

function mergeCompletionLists(...lists: (CompletionList | null | undefined)[]): CompletionList | undefined {
	const items = lists.flatMap(list => list?.items ?? [])
	if (!items.length) return
	return CompletionList.create(items, lists.some(list => list?.isIncomplete === true))
}

function refreshDiagnostics(document: TextDocument) {
	const snapshot = getSnapshot(document)
	if (!snapshot) return connection.sendDiagnostics({ uri: document.uri, diagnostics: [] })

	const diagnostics = cssLS
		.doValidation(snapshot.document, snapshot.stylesheet)
		.filter(diagnostic => containsRange(snapshot.blocks, document, diagnostic.range))

	return connection.sendDiagnostics({ uri: document.uri, diagnostics })
}