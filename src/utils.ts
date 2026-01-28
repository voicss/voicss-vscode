import type { CssTemplate } from '@/types'

export const findCssTemplates = (text: string): CssTemplate[] => {
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