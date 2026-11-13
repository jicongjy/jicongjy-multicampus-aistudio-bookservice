import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// 관리자 전용 정적 빌드(VITE_FORCE_ADMIN=true)는 검색 결과에 나오지 않게 하고 제목을 구분한다.
const adminSeo = {
  name: 'admin-seo',
  transformIndexHtml(html: string) {
    if (process.env.VITE_FORCE_ADMIN !== 'true') return html;
    return html
      .replace(/<title>.*?<\/title>/, '<title>관리자 콘솔 | 오늘의 독서 메뉴</title>')
      .replace(/\s*<link rel="canonical"[^>]*>/, '')
      .replace(/\s*<meta property="og:(url|image|image:width|image:height|image:alt)"[^>]*>/g, '')
      .replace(/\s*<meta name="twitter:image"[^>]*>/, '')
      .replace('<meta name="viewport"', '<meta name="robots" content="noindex, nofollow" />\n    <meta name="viewport"');
  },
};

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), adminSeo],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
