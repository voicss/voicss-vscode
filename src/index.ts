import { languages, MarkdownString, Range, Hover, FoldingRange, FoldingRangeKind, Color, ColorInformation, ColorPresentation, CompletionItem, CompletionList, SnippetString, Diagnostic, DiagnosticSeverity, workspace, DocumentHighlight } from 'vscode'
import { getCSSLanguageService } from 'vscode-css-languageservice'
import { doComplete as doEmmetComplete } from '@vscode/emmet-helper'
import { createCssContext, toHostRange, findCssTemplates, findTemplateByOffset } from '@/utils'
import type { ExtensionContext, Range as RangeI, ColorInformation as ColorInformationI, TextDocument as TextDocumentI } from 'vscode'

const cssLs = getCSSLanguageService()
const docSelectors = ['javascript', 'javascriptreact', 'typescript', 'typescriptreact']

export function activate(context: ExtensionContext) {
	const hoverProvider = languages.registerHoverProvider(docSelectors, { provideHover(doc, pos) {
		const text = doc.getText()
		const offset = doc.offsetAt(pos)
		const tpl = findTemplateByOffset(text, offset, 'tag')
		if (!tpl) return

		const { virtualDoc, stylesheet } = createCssContext(cssLs, tpl)
		const cssPos = virtualDoc.positionAt(offset - tpl.cssStart)

		const lsHover = cssLs.doHover(virtualDoc, cssPos, stylesheet)
		if (!lsHover?.contents) return
		const contents = [lsHover.contents].flat()
		const markdownContents = contents.map(c => new MarkdownString(typeof c === 'string' ? c : c.value))

		let range: RangeI | undefined
		if (lsHover.range) range = toHostRange(doc, tpl, virtualDoc, lsHover.range as RangeI)
		return new Hover(markdownContents, range)
	} })

	const highlightProvider = languages.registerDocumentHighlightProvider(docSelectors, {
		provideDocumentHighlights(doc, pos) {
			const text = doc.getText()
			const offset = doc.offsetAt(pos)
			const tpl = findTemplateByOffset(text, offset, 'css')
			if (!tpl) return

			const { virtualDoc, stylesheet } = createCssContext(cssLs, tpl)
			const cssPos = virtualDoc.positionAt(offset - tpl.cssStart)

			const highlights = cssLs.findDocumentHighlights(virtualDoc, cssPos, stylesheet)
			return highlights.map(h => {
				return new DocumentHighlight(
					toHostRange(doc, tpl, virtualDoc, h.range as RangeI),
					h.kind ? h.kind - 1 : undefined,
				)
			})
		},
	})

	const foldingProvider = languages.registerFoldingRangeProvider(docSelectors, { provideFoldingRanges(doc) {
		const text = doc.getText()
		const result: FoldingRange[] = []

		for (const tpl of findCssTemplates(text)) {
			const { virtualDoc } = createCssContext(cssLs, tpl)
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
				const { virtualDoc, stylesheet } = createCssContext(cssLs, tpl)
				const colors = cssLs.findDocumentColors(virtualDoc, stylesheet)

				for (const c of colors) {
					result.push(new ColorInformation(
						toHostRange(doc, tpl, virtualDoc, c.range as RangeI),
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
			const tpl = findTemplateByOffset(text, offset, 'css')
			if (!tpl) return

			const { virtualDoc, stylesheet } = createCssContext(cssLs, tpl)
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
		const tpl = findTemplateByOffset(text, offset, 'css')
		if (!tpl) return

		const { virtualDoc, stylesheet } = createCssContext(cssLs, tpl)
		const cssPos = virtualDoc.positionAt(offset - tpl.cssStart)

		const completions = cssLs.doComplete(virtualDoc, cssPos, stylesheet)
		const emmetCompletions = doEmmetComplete(virtualDoc, cssPos, 'css', {})
		emmetCompletions?.items.forEach(i => { i.sortText = ' ' })

		const items = [...(emmetCompletions?.items ?? []), ...completions.items]

		return new CompletionList(items.map(item => {
			const completion = new CompletionItem(item.label, item.kind ? item.kind - 1 : undefined)

			const docValue = typeof item.documentation === 'string' ? item.documentation : item.documentation?.value
			if (docValue) completion.documentation = new MarkdownString(docValue)

			if (item.textEdit?.newText) completion.insertText = new SnippetString(item.textEdit.newText)
			completion.detail = item.detail
			completion.tags = item.tags
			completion.sortText = item.sortText
			completion.command = item.command

			return completion
		}), true)
	} }, ':', ';', ' ', '-', '#', '@', '$', '(', ')', '"', '\'', '/', '*', '+', ',', '|', '&', '^', '!', '~', '?', '<', '>', '=')

	const diagnosticCollection = languages.createDiagnosticCollection('rawstyle')

	const validateCssTemplates = (doc: TextDocumentI) => {
		if (!docSelectors.includes(doc.languageId)) return

		const text = doc.getText()
		const diagnostics: Diagnostic[] = []

		for (const tpl of findCssTemplates(text)) {
			const { virtualDoc, stylesheet } = createCssContext(cssLs, tpl)
			const errors = cssLs.doValidation(virtualDoc, stylesheet)

			errors.forEach(error => {
				const startOffset = tpl.cssStart + virtualDoc.offsetAt(error.range.start)
				const endOffset = tpl.cssStart + virtualDoc.offsetAt(error.range.end)
				if (tpl.ignoredRanges.some(([s, e]) => startOffset >= s && endOffset <= e)) return
				const diagnostic = new Diagnostic(
					new Range(doc.positionAt(startOffset), doc.positionAt(endOffset)),
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

	context.subscriptions.push(hoverProvider, highlightProvider, foldingProvider, colorProvider, completionProvider, diagnosticCollection)
}