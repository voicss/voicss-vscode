import { defineConfig, globalIgnores } from 'eslint/config'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintReact from '@eslint-react/eslint-plugin'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import stylistic from '@stylistic/eslint-plugin'

export default defineConfig([
	globalIgnores(['dist'], 'Global Ignores'),
	{
		name: 'Base Rules',
		files: ['**/*.ts?(x)'],
		extends: [eslint.configs.recommended],
	},
	{
		name: 'Type-Aware Rules',
		files: ['**/*.ts?(x)'],
		extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
		languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
		rules: {
			'@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
			'@typescript-eslint/restrict-template-expressions': 'off',
		},
	},
	{
		name: 'React Rules',
		files: ['**/*.tsx'],
		settings: { react: { version: 'detect' } },
		extends: [
			jsxA11y.flatConfigs.strict,
			reactPlugin.configs.flat.recommended,
			reactPlugin.configs.flat['jsx-runtime'],
			reactHooks.configs.flat.recommended,
			eslintReact.configs['recommended-type-checked'],
		],
	},
	{
		name: 'Stylistic Rules',
		files: ['**/*.ts?(x)'],
		extends: [stylistic.configs.recommended],
		rules: {
			'@stylistic/indent': ['error', 'tab'],
			'@stylistic/indent-binary-ops': ['error', 'tab'],
			'@stylistic/no-tabs': 'off',
			'@stylistic/eol-last': ['error', 'never'],
			'@stylistic/arrow-parens': ['error', 'as-needed'],
			'@stylistic/jsx-indent-props': ['error', 'tab'],
			'@stylistic/jsx-one-expression-per-line': 'off',
			'@stylistic/jsx-tag-spacing': ['error', { beforeSelfClosing: 'never' }],
		},
	},
])