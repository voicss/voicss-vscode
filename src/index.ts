import { window, languages, MarkdownString, Range, Hover, FoldingRange, FoldingRangeKind } from 'vscode'
import { getCSSLanguageService } from 'vscode-css-languageservice'
import { TextDocument } from 'vscode-languageserver-textdocument'
import type { DocumentSelector, ExtensionContext, Range as RangeI } from 'vscode'
import type { CssTemplate } from '@/types'

const cssLs = getCSSLanguageService()
const docSelectors: DocumentSelector = [{ language: 'typescript' }, { language: 'typescriptreact' }]

export function activate(context: ExtensionContext) {
	window.showInformationMessage('Rawstyle VS Code extension activated')

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
				const startOffset = tpl.tagStart + virtualDoc.offsetAt({ line: r.startLine, character: 0 })
				const endOffset = tpl.tagStart + virtualDoc.offsetAt({ line: r.endLine, character: 0 })

				const start = doc.positionAt(startOffset)
				const end = doc.positionAt(endOffset)
				if (start.line >= end.line) continue

				result.push({ start: start.line, end: end.line, kind: FoldingRangeKind.Region })
			}
		}

		return result
	} })

	context.subscriptions.push(hoverProvider, foldingProvider)
}

const findCssTemplates = (text: string): CssTemplate[] => {
	const regex = /\bg?css`(.*?)`/gs
	const result: CssTemplate[] = []

	let match: RegExpExecArray | null
	while ((match = regex.exec(text))) {
		let css = match[1]
		const tagStart = text.indexOf('`', match.index) + 1
		const tagEnd = tagStart + css.length
		let cssStart = tagStart
		let cssEnd = tagEnd

		if (!match[0].startsWith('g')) {
			const prefix = '.class { '
			const suffix = ' }'
			css = `${prefix}${css}${suffix}`
			cssStart -= prefix.length
			cssEnd += suffix.length
		}

		result.push({ css, tagStart, tagEnd, cssStart, cssEnd })
	}

	return result
}