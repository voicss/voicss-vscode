import type { UserConfig } from 'tsdown'

const isProd = process.argv.includes('--prod')

export default {
	minify: isProd,
	sourcemap: isProd ? false : 'inline',
	fixedExtension: false,
} satisfies UserConfig