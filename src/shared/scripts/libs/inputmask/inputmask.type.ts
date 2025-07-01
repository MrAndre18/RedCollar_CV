// inputmask.type.ts

export interface InputmaskOptions {
  onBeforeMask?: (value: string, opts: any) => string
}

export interface InputmaskInstance {
  mask: (input: HTMLInputElement) => void
  option: (options: InputmaskOptions) => void
  remove: () => void
}

export type InputmaskApi = {
  init: (selector?: string) => void
  reinit: (input: HTMLInputElement | string) => void
  reinitAll: () => void
}
