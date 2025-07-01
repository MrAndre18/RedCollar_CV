export type TTomSelectElement = string | HTMLSelectElement

export interface TTomSelectOption {
  value: string
  label: string
  [key: string]: any
}

export interface ITomSelectInstance {
  destroy(): void
  getValue(): string | string[]
  setValue(value: string | string[], silent?: boolean): this
  clear(silent?: boolean): this
  clearOptions(): this
  refreshOptions(triggerDropdown?: boolean): this

  addOption(data: TTomSelectOption, user_created?: boolean): string | false
  addOptions(data: TTomSelectOption[], user_created?: boolean): void
  removeOption(value: string, silent?: boolean): this
  getOption(value: string | number, create?: boolean): HTMLElement | null
  addItem(value: string, silent?: boolean): void
  removeItem(item?: string | TTomSelectOption, silent?: boolean): void

  options: { [key: string]: TTomSelectOption }

  lock(): this
  unlock(): this
  enable(): this
  disable(): this
}

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends object ? RecursivePartial<T[P]> : T[P]
}

export interface ITomSelectConfig
  extends RecursivePartial<{
    valueField: string
    labelField: string
    searchField?: string[]
    allowEmptyOption: boolean
    hidePlaceholder: boolean
    placeholder: string
    maxItems: number | null
    onInitialize: () => void
    onItemAdd: (value: string | number, item: HTMLDivElement) => void
    [key: string]: any
  }> {
  placeholder?: string
  onInitialize?: () => void
  onItemAdd?: (value: string | number, item: HTMLDivElement) => void
}
