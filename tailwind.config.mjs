/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				'echo-bg': '#F3F3EE',       // 档案纸米色
				'echo-orange': '#E85D22',   // 警示橙
				'echo-dark': '#1A1A1A',     // 墨黑
				'echo-gray': '#E5E5E5',     // 装饰灰
			},
			fontFamily: {
				// 强制使用等宽字体，营造终端感
				mono: ['"JetBrains Mono"', '"Courier New"', 'Courier', 'monospace'],
			},
			boxShadow: {
				// 核心：硬阴影 (X偏移 Y偏移 模糊 扩散 颜色)
				'hard': '6px 6px 0px 0px #1A1A1A',
				'hard-sm': '3px 3px 0px 0px #1A1A1A',
				'hard-hover': '10px 10px 0px 0px #E85D22', // 悬停变橙色阴影
			}
		},
	},
	plugins: [],
}