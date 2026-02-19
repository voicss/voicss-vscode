export interface CssTemplate {
	css: string
	ignoredRanges: [number, number][]
	tagStart: number
	tagEnd: number
	cssStart: number
	cssEnd: number
}