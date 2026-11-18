import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function inlineCss() {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html
      for (const [fileName, file] of Object.entries(ctx.bundle)) {
        if (fileName.endsWith('.css') && file.source) {
          const linkRegex = new RegExp(`<link[^>]*href="[^"]*${fileName}"[^>]*>`)
          html = html.replace(linkRegex, `<style>${file.source}</style>`)
        }
      }
      return html
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), inlineCss()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: true,
    target: 'esnext',
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          toastui: ['@toast-ui/editor'],
          icons: ['@tabler/icons-react'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    testTimeout: 40000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})
