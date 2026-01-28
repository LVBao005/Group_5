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
        host: true, // Cho phép truy cập từ mạng nội bộ
        port: 5173,
        watch: {
            usePolling: true, // Cần thiết nếu bạn đang code trên một số hệ thống file đặc biệt hoặc WSL
        },
        hmr: {
            overlay: true, // Hiển thị lỗi ngay trên màn hình trình duyệt để bạn biết code sai ở đâu
        }
    }
})
