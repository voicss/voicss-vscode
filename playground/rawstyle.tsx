import { css, gcss } from 'rawstyle'

void css`
	font-size: 14rem;
	font-family: "Tiny5", sans-serif;
	color: var(--foreground);
	text-align: center;
	text-transform: uppercase;
	letter-spacing: -1rem;
	line-height: 0.7;

	.link {
		font-family: system-ui;
		font-size: 1.2rem;

		& > a {
			color: tomato;
			font-size: 1.2rem;

			&:hover, &:focus {
				color: ivory;
				background-color: tomato;
			}
		}
	}
`

void gcss`
	:root {
		--background: #ebebeb;
		--foreground: #303030;
	}

	body {
		background-color: var(--background);
		height: 100vh;
		overflow: hidden;
		margin: 0;
		cursor: crosshair;
		
		&.dark {
			--background: #303030;
			--foreground: #ebebeb;
		}
		
		main {
			display: flex;
			justify-content: center;
			align-items: center;
			
			&:hover {
				cursor: default;
			}
		}
	}
`