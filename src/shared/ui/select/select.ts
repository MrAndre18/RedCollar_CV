import TomSelect from 'tom-select'

import type {
  ITomSelectConfig,
  ITomSelectInstance,
  TTomSelectElement,
  TTomSelectOption
} from './select.type'

const tomSelectInstances = new WeakMap<HTMLSelectElement, ITomSelectInstance>()

const getElement = (el: TTomSelectElement): HTMLSelectElement | null =>
  typeof el === 'string' ? document.querySelector(el) : el

const isInit = (el: TTomSelectElement): boolean => {
  const element = getElement(el)
  return element ? tomSelectInstances.has(element) : false
}

const setLenisPreventAttr = (instance: TomSelect): void => {
  const dropdown = instance.dropdown
  if (dropdown) {
    dropdown.setAttribute('data-lenis-prevent', '')
  }
}

const initTomSelect = (
  element: TTomSelectElement,
  config: ITomSelectConfig = {}
): ITomSelectInstance | null => {
  const el = getElement(element)
  if (!el) return null

  if (isInit(el)) return tomSelectInstances.get(el) || null

  // Проверяем, есть ли уже пустая опция для placeholder
  if (config.placeholder && !el.querySelector('option[value=""]')) {
    const option = new Option(config.placeholder, '', false, false)
    el.add(option, 0)
  }

  const userOnInitialize = config.onInitialize
  const userOnItemAdd = config.onItemAdd

  const mergedOnInitialize = function (this: TomSelect) {
    el.setAttribute('data-tomselect-init', 'true')

    setLenisPreventAttr(this)

    // Устанавливаем placeholder после инициализации
    if (config.placeholder) {
      this.settings.placeholder = config.placeholder
      this.control_input.placeholder = config.placeholder

      // Если нет выбранного значения, показываем placeholder
      if (!this.getValue()) {
        this.control_input.style.display = 'block'
      }
    }

    // Вызываем пользовательский callback
    userOnInitialize?.call(this)
  }

  const mergedOnItemAdd = function (this: TomSelect, value: string | number, item: HTMLDivElement) {
    item.style.cursor = 'pointer'
    item.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()
      this.removeItem(value as string)
    })

    userOnItemAdd?.call(this, value, item)
  }

  const instance = new TomSelect(el, {
    valueField: 'value',
    labelField: 'label',
    searchField: ['label'],
    allowEmptyOption: config.placeholder ? true : false, // Важно!
    hidePlaceholder: false,
    ...config,
    onInitialize: mergedOnInitialize,
    onItemAdd: mergedOnItemAdd
  }) as unknown as ITomSelectInstance

  tomSelectInstances.set(el, instance)
  return instance
}

const reInitTomSelect = (
  element: TTomSelectElement,
  config: ITomSelectConfig = {}
): ITomSelectInstance | null => {
  const el = getElement(element)
  if (!el) return null

  const instance = tomSelectInstances.get(el)
  if (instance) {
    instance.destroy()
    tomSelectInstances.delete(el)
    el.removeAttribute('data-tomselect-init')
  }

  return initTomSelect(el, config)
}

const tomSelectModule = {
  initAll(config: ITomSelectConfig = {}): void {
    document.querySelectorAll<HTMLSelectElement>('[data-tomselect]').forEach(el => {
      initTomSelect(el, config)
    })
  },

  init: initTomSelect,

  reInit: reInitTomSelect,

  reInitAll(config: ITomSelectConfig = {}): void {
    document.querySelectorAll<HTMLSelectElement>('[data-tomselect]').forEach(el => {
      reInitTomSelect(el, config)
    })
  },

  destroy(element: TTomSelectElement): void {
    const el = getElement(element)
    if (!el) return

    const instance = tomSelectInstances.get(el)
    if (instance) {
      instance.destroy()
      tomSelectInstances.delete(el)
      el.removeAttribute('data-tomselect-init')
    }
  },

  destroyAll(): void {
    document.querySelectorAll<HTMLSelectElement>('[data-tomselect]').forEach(el => {
      const instance = tomSelectInstances.get(el)
      if (instance) {
        instance.destroy()
        tomSelectInstances.delete(el)
        el.removeAttribute('data-tomselect-init')
      }
    })
  },

  resetOptions(
    element: TTomSelectElement,
    options: TTomSelectOption[],
    defaultOption: string | null = null,
    triggerDefaultOptionAfterReset: boolean = false
  ): void {
    const el = getElement(element)
    if (!el) return

    const instance = tomSelectInstances.get(el)
    let defaultValue = defaultOption

    if (defaultValue !== null && !options.some(opt => opt.value === defaultValue)) {
      console.error('Default value not found in options')
      defaultValue = null
    }

    if (defaultValue === null && options.length > 0) {
      defaultValue = options[0].value
    }

    if (instance) {
      instance.clear(true)
      instance.clearOptions()

      instance.addOptions(options)

      if (defaultValue !== null) {
        instance.setValue(defaultValue, true)
      } else {
        instance.clear(true)
      }
      instance.refreshOptions(false)
    } else {
      const currentValue = el.value

      el.innerHTML = options
        .map(opt => `<option value="${opt.value}">${opt.label}</option>`)
        .join('')

      if (defaultValue !== null) {
        el.value = defaultValue
      } else {
        if (!options.some(opt => opt.value === currentValue)) {
          el.value = ''
        }
      }
    }

    if (triggerDefaultOptionAfterReset) {
      el.dispatchEvent(new Event('change', { bubbles: true }))
    }
  },

  addOption(element: TTomSelectElement, option: TTomSelectOption): void {
    const el = getElement(element)
    const instance = el ? tomSelectInstances.get(el) : null

    if (instance) {
      instance.addOption(option)
      instance.refreshOptions(false)
    } else if (el) {
      const newOption = new Option(option.label, option.value, false, false)
      el.add(newOption)
    }
  },

  removeOption(element: TTomSelectElement, optionValue: string): void {
    const el = getElement(element)
    const instance = el ? tomSelectInstances.get(el) : null

    if (instance) {
      instance.removeOption(optionValue)
      instance.refreshOptions(false)
    } else if (el) {
      const option = el.querySelector(`option[value="${optionValue}"]`)
      if (option) option.remove()
    }
  },

  removeAllOptions(element: TTomSelectElement): void {
    const el = getElement(element)
    const instance = el ? tomSelectInstances.get(el) : null

    if (instance) {
      instance.clear(true)
      instance.clearOptions()
      instance.refreshOptions(false)
    }
  },

  getCurrentOption(element: TTomSelectElement): TTomSelectOption | TTomSelectOption[] | null {
    const el = getElement(element)
    const instance = el ? tomSelectInstances.get(el) : null

    if (instance) {
      const value = instance.getValue()
      if (Array.isArray(value)) {
        return value.map(v => ({
          value: v,
          label: instance.options[v]?.label || ''
        }))
      }
      const option = instance.options[value as string]
      return option ? { value: value as string, label: option.label } : null
    } else if (el) {
      if (el.multiple) {
        return Array.from(el.selectedOptions).map((opt: HTMLOptionElement) => ({
          value: opt.value,
          label: opt.label
        }))
      }
      const selectedOption = el.options[el.selectedIndex]
      return selectedOption ? { value: selectedOption.value, label: selectedOption.label } : null
    }
    return null
  },

  getValue(element: TTomSelectElement): string | string[] | null {
    const el = getElement(element)
    const instance = el ? tomSelectInstances.get(el) : null

    if (instance) {
      return instance.getValue()
    }
    if (el) {
      return el.multiple
        ? Array.from(el.selectedOptions).map((opt: HTMLOptionElement) => opt.value)
        : el.value
    }
    return null
  },

  setValue(element: TTomSelectElement, value: string | string[]): void {
    const el = getElement(element)
    const instance = el ? tomSelectInstances.get(el) : null

    if (instance) {
      instance.setValue(value, true)
    } else if (el) {
      if (Array.isArray(value)) {
        Array.from(el.options).forEach(
          (opt: HTMLOptionElement) =>
            (opt.selected = Array.isArray(value) && value.includes(opt.value))
        )
      } else {
        el.value = value
      }
      el.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }
}

export const selectApi = {
  init: tomSelectModule.init.bind(tomSelectModule),
  initAll: tomSelectModule.initAll.bind(tomSelectModule),
  reInit: tomSelectModule.reInit.bind(tomSelectModule),
  reInitAll: tomSelectModule.reInitAll.bind(tomSelectModule),
  destroy: tomSelectModule.destroy.bind(tomSelectModule),
  destroyAll: tomSelectModule.destroyAll.bind(tomSelectModule),
  resetOptions: tomSelectModule.resetOptions.bind(tomSelectModule),
  addOption: tomSelectModule.addOption.bind(tomSelectModule),
  removeOption: tomSelectModule.removeOption.bind(tomSelectModule),
  removeAllOptions: tomSelectModule.removeAllOptions.bind(tomSelectModule),
  getCurrentOption: tomSelectModule.getCurrentOption.bind(tomSelectModule),
  getValue: tomSelectModule.getValue.bind(tomSelectModule),
  setValue: tomSelectModule.setValue.bind(tomSelectModule),
  isInit,
  getInstance: (element: TTomSelectElement) => {
    const el = getElement(element)
    return el ? tomSelectInstances.get(el) : undefined
  }
}