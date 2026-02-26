import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: true,
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:8080/backend',
                changeOrigin: true,
                configure: (proxy, _options) => {
                    proxy.on('proxyRes', (proxyRes, req, res) => {
                        const setCookie = proxyRes.headers['set-cookie'];
                        if (setCookie) {
                            proxyRes.headers['set-cookie'] = setCookie.map(cookie =>
                                cookie.replace(/Path=\/backend/i, 'Path=/')
                            );
                        }
                    });
                }
            },
        },
        watch: {
            usePolling: true,
        },
        hmr: {
            overlay: true,
        }
    }
})
