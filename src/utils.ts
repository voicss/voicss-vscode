import { Range } from 'vscode'
import { TEMPLATE_PATTERN } from 'rawstyle'
import { TextDocument } from 'vscode-languageserver-textdocument'
import type { Range as RangeI, TextDocument as TextDocumentI } from 'vscode'
import type { LanguageService } from 'vscode-css-languageservice'
import type { CssTemplate } from '@/types'

export const createCssContext = (cssLs: LanguageService, tpl: CssTemplate, css?: string) => {
	const virtualDoc = TextDocument.create('rawstyle.css', 'css', 1, css ?? tpl.css)
	const stylesheet = cssLs.parseStylesheet(virtualDoc)
	return { virtualDoc, stylesheet }
}

export const toHostRange = (doc: TextDocumentI, tpl: CssTemplate, virtualDoc: TextDocument, range: RangeI) => {
	const startOffset = tpl.cssStart + virtualDoc.offsetAt(range.start)
	const endOffset = tpl.cssStart + virtualDoc.offsetAt(range.end)
	return new Range(doc.positionAt(startOffset), doc.positionAt(endOffset))
}

export const findCssTemplates = (text: string): CssTemplate[] => {
	const result: CssTemplate[] = []
	for (const match of text.matchAll(TEMPLATE_PATTERN)) {
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

		result.push({ css, validCss: sanitizeCss(css), tagStart, tagEnd, cssStart, cssEnd })
	}

	return result
}

const sanitizeCss = (css: string) => {
	let validCss = css
	for (const match of css.matchAll(/^.*?if\([\s\S]*?\);/gm))
		validCss = validCss.replace(match[0], `/*${match[0].slice(4)}*/`)
	return validCss
}

export const findTemplateByOffset = (text: string, offset: number, region: 'tag' | 'css') => findCssTemplates(text).find(t =>
	offset >= t[region === 'tag' ? 'tagStart' : 'cssStart']
	&& offset < t[region === 'tag' ? 'tagEnd' : 'cssEnd'],
)