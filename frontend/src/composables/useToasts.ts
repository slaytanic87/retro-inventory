import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  tone: 'success' | 'info' | 'error'
}

const toasts = ref<Toast[]>([])
let nextId = 1

export function useToasts() {
  function push(message: string, tone: Toast['tone'] = 'success', ttl = 3600) {
    const id = nextId++
    toasts.value = [...toasts.value, { id, message, tone }]
    setTimeout(() => dismiss(id), ttl)
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return { toasts, push, dismiss }
}
