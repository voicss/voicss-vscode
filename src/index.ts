import { window, languages, MarkdownString, Range, Hover } from 'vscode'
import { getCSSLanguageService } from 'vscode-css-languageservice'
import { TextDocument } from 'vscode-languageserver-textdocument'
import type { DocumentSelector, ExtensionContext, Range as RangeI } from 'vscode'

const cssLs = getCSSLanguageService()
const docSelectors: DocumentSelector = [{ language: 'typescript' }, { language: 'typescriptreact' }]

export function activate(context: ExtensionContext) {
	window.showInformationMessage('Rawstyle VS Code extension activated')

	const hoverProvider = languages.registerHoverProvider(docSelectors, { provideHover(doc, pos) {
		const text = doc.getText()
		const offset = doc.offsetAt(pos)
		const template = findCssTemplate(text, offset)
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
			console.log(rangeStartOffset, rangeEndOffset)
			range = new Range(doc.positionAt(rangeStartOffset), doc.positionAt(rangeEndOffset))
		}
		return new Hover(markdownContents, range)
	} })

	context.subscriptions.push(hoverProvider)
}

const findCssTemplate = (text: string, offset: number): { css: string, cssStart: number } | null => {
	const regex = /\bg?css`(.*?)`/gs

	let match: RegExpExecArray | null
	while ((match = regex.exec(text))) {
		let css = match[1]
		let cssStart = text.indexOf('`', match.index) + 1
		const cssEnd = cssStart + css.length
		if (offset < cssStart || offset >= cssEnd) continue
		if (!match[0].startsWith('g')) {
			const prefix = '.class { '
			css = `${prefix}${css} }`
			cssStart -= prefix.length
		}
		return { css, cssStart }
	}

	return null
}