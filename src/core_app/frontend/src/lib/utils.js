import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Hàm cn hỗ trợ merge các class Tailwind CSS và xử lý conditional classes
 * Sử dụng clsx để kết hợp các class và tailwind-merge để xử lý xung đột class
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}