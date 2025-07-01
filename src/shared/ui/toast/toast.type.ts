import type { Options as ToastifyOptions } from 'toastify-js'
import type { Toast } from './toast'

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'default';

export interface ToastifyInstance {
  showToast: () => void
  hideToast: () => void
}

export type ToastOptions = ToastifyOptions & {
  onClick?: (toast: Toast) => void
  onShown?: (toast: Toast) => void
  onHidden?: (toast: Toast) => void
  type?: ToastType
  closeElement?: string | HTMLElement
}

export enum ToastEvent {
  Init = 'toast:initialized',
  Open = 'toast:opened',
  Close = 'toast:closed',
  GlobalInit = 'toast:global-initialized',
  GlobalOpen = 'toast:global-opened',
  GlobalClose = 'toast:global-closed'
}

// ✅ SUPPORTED_KEYS теперь здесь, без циклов
export const SUPPORTED_KEYS = [
  'text',
  'duration',
  'destination',
  'newWindow',
  'gravity',
  'position',
  'stopOnFocus',
  'className',
  'offset',
  'style',
  'ariaLive',
  'oldestFirst'
] as const

export type SupportedKey = (typeof SUPPORTED_KEYS)[number]

// ✅ Используется для безопасного парсинга из DOM
export type ToastOptionsDOM = Pick<ToastOptions, SupportedKey>
