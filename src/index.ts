import { languages, MarkdownString, Range, Hover, FoldingRange, FoldingRangeKind, Color, ColorInformation, ColorPresentation, CompletionItem, SnippetString, Diagnostic, DiagnosticSeverity, workspace } from 'vscode'
import { getCSSLanguageService } from 'vscode-css-languageservice'
import { TextDocument } from 'vscode-languageserver-textdocument'
import { findCssTemplates } from '@/utils'
import type { ExtensionContext, Range as RangeI, ColorInformation as ColorInformationI, TextDocument as TextDocumentI } from 'vscode'

const cssLs = getCSSLanguageService()
const docSelectors = ['typescriptreact', 'typescript', 'javascriptreact', 'javascript']

export function activate(context: ExtensionContext) {
	const hoverProvider = languages.registerHoverProvider(docSelectors, { provideHover(doc, pos) {
		const text = doc.getText()
		const offset = doc.offsetAt(pos)
		const template = findCssTemplates(text).find(t => offset >= t.tagStart && offset < t.tagEnd)
		if (!template) return null

		const { css, cssStart } = template
		const virtualDoc = TextDocument.create('rawstyle.css', 'css', 1, css)
		const stylesheet = cssLs.parseStylesheet(virtualDoc)
		const relPos = virtualDoc.positionAt(offset - cssStart)

		const lsHover = cssLs.doHover(virtualDoc, relPos, stylesheet)
		if (!lsHover?.contents) return null
		const contents = [lsHover.contents].flat()
		const markdownContents = contents.map(c => new MarkdownString(typeof c === 'string' ? c : c.value))

		let range: RangeI | undefined
		if (lsHover.range) {
			const rangeStartOffset = cssStart + virtualDoc.offsetAt(lsHover.range.start)
			const rangeEndOffset = cssStart + virtualDoc.offsetAt(lsHover.range.end)
			range = new Range(doc.positionAt(rangeStartOffset), doc.positionAt(rangeEndOffset))
		}
		return new Hover(markdownContents, range)
	} })

	const foldingProvider = languages.registerFoldingRangeProvider(docSelectors, { provideFoldingRanges(doc) {
		const text = doc.getText()
		const result: FoldingRange[] = []

		for (const tpl of findCssTemplates(text)) {
			const virtualDoc = TextDocument.create('rawstyle.css', 'css', 1, tpl.css)
			const ranges = cssLs.getFoldingRanges(virtualDoc)
			if (!ranges.length) continue

			for (const r of ranges) {
				const startOffset = tpl.cssStart + virtualDoc.offsetAt({ line: r.startLine, character: 0 })
				const endOffset = tpl.cssStart + virtualDoc.offsetAt({ line: r.endLine, character: 0 })

				const start = doc.positionAt(startOffset)
				const end = doc.positionAt(endOffset)
				if (start.line >= end.line) continue

				result.push({ start: start.line, end: end.line, kind: FoldingRangeKind.Region })
			}
		}

		return result
	} })

	const colorProvider = languages.registerColorProvider(docSelectors, {
		provideDocumentColors(doc) {
			const text = doc.getText()
			const result: ColorInformationI[] = []

			for (const tpl of findCssTemplates(text)) {
				const virtualDoc = TextDocument.create('rawstyle.css', 'css', 1, tpl.css)
				const stylesheet = cssLs.parseStylesheet(virtualDoc)
				const colors = cssLs.findDocumentColors(virtualDoc, stylesheet)

				for (const c of colors) {
					const startOffset = tpl.cssStart + virtualDoc.offsetAt(c.range.start)
					const endOffset = tpl.cssStart + virtualDoc.offsetAt(c.range.end)

					result.push(new ColorInformation(
						new Range(doc.positionAt(startOffset), doc.positionAt(endOffset)),
						new Color(c.color.red, c.color.green, c.color.blue, c.color.alpha),
					))
				}
			}

			return result
		},

		provideColorPresentations(color, context) {
			const doc = context.document
			const text = doc.getText()
			const offset = doc.offsetAt(context.range.start)
			const tpl = findCssTemplates(text).find(t => offset >= t.cssStart && offset < t.cssEnd)
			if (!tpl) return

			const virtualDoc = TextDocument.create('rawstyle.css', 'css', 1, tpl.css)
			const stylesheet = cssLs.parseStylesheet(virtualDoc)
			const cssRange = {
				start: virtualDoc.positionAt(offset - tpl.cssStart),
				end: virtualDoc.positionAt(offset - tpl.cssStart + doc.offsetAt(context.range.end) - offset),
			}
			const colorInfo = { red: color.red, green: color.green, blue: color.blue, alpha: color.alpha }
			const presentations = cssLs.getColorPresentations(virtualDoc, stylesheet, colorInfo, cssRange)
			return presentations.map(p => new ColorPresentation(p.label))
		},
	})

	const completionProvider = languages.registerCompletionItemProvider(docSelectors, { provideCompletionItems(doc, pos) {
		const text = doc.getText()
		const offset = doc.offsetAt(pos)
		const tpl = findCssTemplates(text).find(t => offset >= t.cssStart && offset < t.cssEnd)
		if (!tpl) return null

		const virtualDoc = TextDocument.create('rawstyle.css', 'css', 1, tpl.css)
		const stylesheet = cssLs.parseStylesheet(virtualDoc)
		const cssPos = virtualDoc.positionAt(offset - tpl.cssStart)

		const completions = cssLs.doComplete(virtualDoc, cssPos, stylesheet)
		return completions.items.map(item => {
			const completion = new CompletionItem(item.label, item.kind ? item.kind -= 1 : undefined)

			const docValue = typeof item.documentation === 'string' ? item.documentation : item.documentation?.value
			if (docValue) completion.documentation = new MarkdownString(docValue)

			if (item.textEdit?.newText) completion.insertText = new SnippetString(item.textEdit.newText)
			completion.detail = item.detail
			completion.tags = item.tags
			completion.sortText = item.sortText
			completion.command = item.command

			return completion
		})
	} }, ':', ';', ' ', '-', '#', '@', '$', '(', ')', '"', '\'', '/', '*', '+', ',', '|', '&', '^', '!', '~', '?', '<', '>', '=')

	const diagnosticCollection = languages.createDiagnosticCollection('rawstyle')

	const validateCssTemplates = (doc: TextDocumentI) => {
		if (!docSelectors.includes(doc.languageId)) return

		const text = doc.getText()
		const diagnostics: Diagnostic[] = []

		for (const tpl of findCssTemplates(text)) {
			const virtualDoc = TextDocument.create('rawstyle.css', 'css', 1, tpl.css)
			const stylesheet = cssLs.parseStylesheet(virtualDoc)
			const errors = cssLs.doValidation(virtualDoc, stylesheet)

			errors.forEach(error => {
				const startPos = doc.positionAt(tpl.cssStart + virtualDoc.offsetAt(error.range.start))
				const endPos = doc.positionAt(tpl.cssStart + virtualDoc.offsetAt(error.range.end))
				const diagnostic = new Diagnostic(
					new Range(startPos, endPos),
					error.message,
					error.severity === 1 ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
				)
				diagnostic.source = `${error.source}(${error.code})`
				diagnostics.push(diagnostic)
			})
		}

		diagnosticCollection.set(doc.uri, diagnostics)
	}

	workspace.textDocuments.forEach(doc => validateCssTemplates(doc))
	workspace.onDidOpenTextDocument(doc => validateCssTemplates(doc))
	workspace.onDidChangeTextDocument(e => validateCssTemplates(e.document))
	workspace.onDidCloseTextDocument(doc => diagnosticCollection.delete(doc.uri))

	context.subscriptions.push(hoverProvider, foldingProvider, colorProvider, completionProvider, diagnosticCollection)
}