import { TEMPLATE_PATTERN } from 'rawstyle'
import type { CssTemplate } from '@/types'

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

		result.push({ css, tagStart, tagEnd, cssStart, cssEnd })
	}

	return result
}