import { SUPPORTED_KEYS, type SupportedKey, type ToastOptions } from './toast.type'

const parseAttribute = (key: SupportedKey, value: string): any => {
  switch (key) {
    case 'duration':
      return parseInt(value, 10)
    case 'newWindow':
    case 'stopOnFocus':
    case 'oldestFirst':
      return value === 'true'
    case 'offset':
    case 'style':
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    default:
      return value
  }
}

export const parseToastOptionsFromElement = (
  el: HTMLElement
): ToastOptions & { node: HTMLElement; closeElement?: HTMLElement } => {
  const options: ToastOptions & { node: HTMLElement; closeElement?: HTMLElement } = { node: el }

  const closeEl = el.querySelector('[data-toast-close]')
  if (closeEl instanceof HTMLElement) {
    options.closeElement = closeEl
  }

  for (const key of SUPPORTED_KEYS) {
    const attr = el.dataset[key.toLowerCase() as keyof DOMStringMap]
    if (attr !== undefined) {
      (options as any)[key] = parseAttribute(key, attr)
    }
  }

  return options
}
