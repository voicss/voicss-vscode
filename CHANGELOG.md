# Changelog


## &ensp; [` 📦 v0.7.0  `](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.6.5...v0.7.0)

### &emsp; 🧨 BREAKING CHANGES
- **Rawstyle v0.6 adaptation**: the `gcss` API is no longer supported; global styles are now detected by context (expression vs assignment). [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/2c8e025)

### &emsp; 🩹 Fixes
- **CSS variable completion**: fixed duplicated `-` prefix when completing CSS variables. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/e485e20)

##### &emsp;&emsp; [Full Changelog](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.6.5...v0.7.0) &ensp;•&ensp; Feb 28, 2026


## &ensp; [` 📦 v0.6.5  `](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.6.4...v0.6.5)

### &emsp; 🩹 Fixes
- **Fixed duplicated `!` in `!important` snippet**: the `!important` snippet now inserts only `important`, preventing double exclamation marks in completions. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/2c363e2)

##### &emsp;&emsp; [Full Changelog](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.6.4...v0.6.5) &ensp;•&ensp; Feb 20, 2026


## &ensp; [` 📦 v0.6.4  `](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.6.3...v0.6.4)

### &emsp; 🩹 Fixes
- **Prioritized Emmet abbreviations**: Emmet abbreviations now always appear at the top of the suggestion list, ahead of other completions. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/c23cd11)
- **Corrected conditional block handling**: fixed CSS sanitization for multiple `if` blocks, resolving issues with misaligned color swatches, warnings, and hovers. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/4e148eb)

##### &emsp;&emsp; [Full Changelog](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.6.3...v0.6.4) &ensp;•&ensp; Feb 20, 2026


## &ensp; [` 📦 v0.6.3  `](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.6.2...v0.6.3)

### &emsp; 🩹 Fixes
- **Color swatches in conditional CSS**: color swatches now display correctly for CSS properties followed by `if()` blocks. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/0d44e2b)

##### &emsp;&emsp; [Full Changelog](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.6.2...v0.6.3) &ensp;•&ensp; Feb 19, 2026


## &ensp; [` 📦 0.6.2  `](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.6.1...v0.6.2)

### &emsp; 🩹 Fixes
- **Corrected validation exclusions**: CSS validation now properly ignores block comments, line comments, and regex literals, preventing false diagnostics. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/2237b7b)

##### &emsp;&emsp; [Full Changelog](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.6.1...v0.6.2) &ensp;•&ensp; Feb 16, 2026


## &ensp; [` 📦 v0.6.1  `](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.6.0...v0.6.1)

### &emsp; 🩹 Fixes
- **Suppressed false positives in regex regions**: validation now skips regions matching regular expressions, preventing incorrect CSS errors inside template strings. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/668f880)

##### &emsp;&emsp; [Full Changelog](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.6.0...v0.6.1) &ensp;•&ensp; Feb 15, 2026


## &ensp; [` 📦 v0.6.0  `](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.5.1...v0.6.0)

### &emsp; 🎁 Features
- **Support for `if-else` blocks**: validation now skips errors inside `if()` blocks in CSS templates, preventing false positives from the CSS language service. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/5517a30)

##### &emsp;&emsp; [Full Changelog](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.5.1...v0.6.0) &ensp;•&ensp; Feb 13, 2026


## &ensp; [` 📦 v0.5.1  `](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.5.0...v0.5.1)

### &emsp; 🩹 Fixes
- **Bundled emmet-helper**: extension now works correctly after vsix installation by bundling `@vscode/emmet-helper` in the output. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/575de19)

##### &emsp;&emsp; [Full Changelog](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.5.0...v0.5.1) &ensp;•&ensp; Feb 11, 2026


## &ensp; [` 📦 v0.5.0  `](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.4.0...v0.5.0)

### &emsp; 🎁 Features
- **Emmet CSS snippets**: Emmet-powered CSS snippets are now available inside Rawstyle template literals. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/06667e0)

### &emsp; 🩹 Fixes
- **Standard CSS comments**: resolved an issue where JS-style comments (`//`) were used instead of CSS-style comments (`/* */`) when toggling comments inside templates. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/48297f3)

##### &emsp;&emsp; [Full Changelog](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.4.0...v0.5.0) &ensp;•&ensp; Feb 11, 2026


## &ensp; [` 📦 v0.4.0  `](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.3.0...v0.4.0)

### &emsp; 🎁 Features
- **CSS symbol highlighting**: enabled highlighting of CSS symbols (properties, values, variables) when the cursor is on them. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/3998c93)

### &emsp; 🩹 Fixes
- **Completion popup trigger fix**: inserting a line break in CSS templates no longer opens the completion popup. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/ddd9a88)

##### &emsp;&emsp; [Full Changelog](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.3.0...v0.4.0) &ensp;•&ensp; Feb 10, 2026


## &ensp; [` 📦 v0.3.0  `](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.2.1...v0.3.0)

### &emsp; 🎁 Features
- **Expanded completion triggers**: added more trigger characters for CSS completions, providing more flexible and comprehensive suggestions when working with CSS templates. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/8647d3b)

##### &emsp;&emsp; [Full Changelog](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.2.1...v0.3.0) &ensp;•&ensp; Feb 9, 2026


## &ensp; [` 📦 v0.2.1  `](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.2.0...v0.2.1)

### &emsp; 📚 Documentation
- **Documentation & branding**: introduced a `README.md` with project overview, features and usage instructions; added `logo.png` and `demo.png` for branding and visual demonstration. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/8568b27)

##### &emsp;&emsp; [Full Changelog](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.2.0...v0.2.1) &ensp;•&ensp; Feb 8, 2026


## &ensp; [` 📦 v0.2.0  `](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.1.1...v0.2.0)

### &emsp; 🎁 Features
- **CSS validation in templates**: Rawstyle templates now provide in-editor CSS diagnostics, surfacing errors and warnings directly in JS/TS(X) files. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/00c31cf)

### &emsp; 🩹 Fixes
- **Provider support for JS(X)**: Rawstyle language features now work in JavaScript and JSX files, not just TS(X). [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/9ad9149)

##### &emsp;&emsp; [Full Changelog](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.1.1...v0.2.0) &ensp;•&ensp; Feb 3, 2026


## &ensp; [` 📦 v0.1.1  `](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.1.0...v0.1.1)

### &emsp; 🩹 Fixes
- **Restricted injection scope**: Rawstyle syntax highlighting no longer leaks into regular strings or comments to prevent incorrect coloring. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/be21d57)

##### &emsp;&emsp; [_Full Changelog_](https://github.com/rawstylecss/rawstyle-vscode/compare/v0.1.0...v0.1.1) &ensp;•&ensp; _Feb 3, 2026_


## &ensp; [` 📦 v0.1.0  `](https://github.com/rawstylecss/rawstyle-vscode/commits/v0.1.0)

### &emsp; 🎁 Features
- **CSS autocomplete**: added intelligent CSS code completion and snippet suggestions within Rawstyle template literals. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/d2709eb)
- **Color picker and swatches**: enabled color picker, swatches, and color format conversions in Rawstyle CSS templates. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/eb95aad)
- **CSS folding in templates**: introduced folding support for CSS inside `css` and `gcss` template literals. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/1288139)
- **CSS hover tooltips**: enabled hover tooltips to display CSS property and value documentation within Rawstyle templates. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/c452bc2)
- **CSS injection**: added CSS injection grammar for Rawstyle templates in JS/TS/JSX/TSX files. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/8f9bcf5)
- **Custom CSS grammar with nesting**: added extended CSS TextMate grammar for syntax highlighting with nesting support in Rawstyle templates and vanilla CSS files. [🡥](https://github.com/rawstylecss/rawstyle-vscode/commit/270f0b3)

##### &emsp;&emsp; [_Full Changelog_](https://github.com/rawstylecss/rawstyle-vscode/commits/v0.1.0) &ensp;•&ensp; _Jan 29, 2026_