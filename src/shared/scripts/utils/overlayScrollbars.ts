import {
  OverlayScrollbars,
  ScrollbarsHidingPlugin,
  SizeObserverPlugin,
  ClickScrollPlugin,
  type PartialOptions
} from 'overlayscrollbars'

const instances = new Map<HTMLElement, OverlayScrollbars>()

const defaultOptions: PartialOptions = {
  paddingAbsolute: false,
  showNativeOverlaidScrollbars: false,
  update: {
    elementEvents: [['img', 'load']],
    debounce: [0, 33],
    attributes: null,
    ignoreMutation: null
  },
  overflow: {
    x: 'scroll',
    y: 'scroll'
  },
  scrollbars: {
    theme: 'os-theme-default',
    visibility: 'auto',
    autoHide: 'scroll',
    autoHideDelay: 1300,
    autoHideSuspend: false,
    dragScroll: true,
    clickScroll: true,
    pointers: ['mouse', 'touch', 'pen']
  }
}

const themeOptions: Record<string, PartialOptions> = {
  dark: {
    scrollbars: {
      autoHide: 'never'
    }
  }
}

OverlayScrollbars.plugin([
  ScrollbarsHidingPlugin,
  SizeObserverPlugin,
  ClickScrollPlugin
])

export const initOverlayScrollbars = (): void => {
  instances.forEach(inst => inst.destroy())
  instances.clear()

  document
    .querySelectorAll<HTMLElement>('[data-scrollbar]')
    .forEach(el => {
      const key = el.dataset.scrollbar ?? ''
      const overrides = themeOptions[key] ?? {}
      const scrollbars = {
        ...defaultOptions.scrollbars,
        theme: `os-theme-${key || 'default'}`,
        ...overrides.scrollbars
      }
      const opts: PartialOptions = {
        ...defaultOptions,
        ...overrides,
        scrollbars
      }
      instances.set(el, OverlayScrollbars(el, opts))
    })
}
