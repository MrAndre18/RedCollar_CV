import { TabsManagerApi } from './tabs-manager'
import { defaultTabsOptions } from './tabs.defaults'
import type { PanelElement, TabElement, TabsOptions } from './tabs.type'

export class Tabs {
  public container: HTMLElement
  public options: TabsOptions
  public instance: Tabs

  private tabList!: HTMLElement
  private tabs: TabElement[] = []
  private panels: PanelElement[] = []
  private activeTab: TabElement | null = null
  private tabHandlers: Map<TabElement, { click: EventListener; keydown: EventListener }> = new Map()

  constructor(container: HTMLElement, options: TabsOptions = defaultTabsOptions) {
    this.container = container
    this.options = { ...defaultTabsOptions, ...options }
    this.instance = this

    TabsManagerApi.register(this)
    this.init()
  }

  public init(): void {
    if (this.container.dataset.tabsInit === 'true') return

    const tabList = this.container.querySelector<HTMLElement>('[role="tablist"]')
    if (!tabList) throw new Error('[Tabs] Tablist element not found')
    this.tabList = tabList

    this.tabs = Array.from(tabList.querySelectorAll('[role="tab"]')) as TabElement[]
    this.panels = Array.from(this.container.querySelectorAll('[role="tabpanel"]'))

    this.tabs.forEach((tab, index) => this.bindTab(tab, index))

    const initiallyActive = this.tabs.find(t => t.getAttribute('aria-selected') === 'true')
    this.activeTab = null
    this.setActive(initiallyActive ?? this.tabs[0])

    this.container.dataset.tabsInit = 'true'
  }

  public reinit(): void {
    this.destroy()
    this.init()
  }

  public destroy(): void {
    this.tabHandlers.forEach((handlers, tab) => {
      tab.removeEventListener('click', handlers.click)
      tab.removeEventListener('keydown', handlers.keydown)
    })
    this.tabHandlers.clear()

    this.tabs.forEach(tab => {
      const clone = tab.cloneNode(true) as TabElement
      tab.replaceWith(clone)
    })

    this.panels.forEach(panel => {
      const clone = panel.cloneNode(true) as PanelElement
      panel.replaceWith(clone)
    })

    delete this.container.dataset.tabsInit
    this.tabs = []
    this.panels = []
    this.activeTab = null

    this.options.onDestroy?.(this)
  }

  public getActive(): TabElement | null {
    return this.activeTab
  }

  public setActive(input: string | TabElement | number): void {
    const tab =
      typeof input === 'number'
        ? this.tabs[input]
        : typeof input === 'string'
          ? this.tabs.find(t => t.id === input)
          : input

    if (!tab || tab === this.activeTab) return

    const prevTab = this.activeTab
    this.activeTab = tab

    if (prevTab && this.tabList.scrollWidth > this.tabList.clientWidth) {
      this.scrollTabIntoView(tab, prevTab)
    }

    this.tabs.forEach(t => {
      const isActive = t === tab
      t.classList.toggle('active', isActive)
      t.setAttribute('aria-selected', String(isActive))
      t.setAttribute('tabindex', isActive ? '0' : '-1')
    })

    this.panels.forEach(panel => {
      const isActive = panel.getAttribute('aria-labelledby') === tab.id

      if (isActive && this.options.lazy) {
        const lazy = panel.querySelector('[data-tab-lazy]')
        if (lazy) lazy.removeAttribute('data-tab-lazy')
      }

      panel.classList.remove('fade', 'slide', 'active')

      if (this.options.animation && this.options.animation !== 'none') {
        panel.classList.add(this.options.animation)
      }

      requestAnimationFrame(() => {
        panel.classList.toggle('active', isActive)
      })
    })

    this.options.onChange?.({ activeTab: tab, prevTab })
  }

  private bindTab(tab: TabElement, index: number): void {
    const isSelected = tab.getAttribute('aria-selected') === 'true'
    if (isSelected) this.activeTab = tab

    tab.setAttribute('tabindex', isSelected ? '0' : '-1')

    const clickHandler = () => this.setActive(tab)
    const keydownHandler = (e: Event) => this.handleKey(e as KeyboardEvent, index)

    tab.addEventListener('click', clickHandler)
    tab.addEventListener('keydown', keydownHandler)

    this.tabHandlers.set(tab, {
      click: clickHandler,
      keydown: keydownHandler
    })
  }

  private handleKey(e: KeyboardEvent, index: number): void {
    const total = this.tabs.length
    let next = index

    switch (e.key) {
      case 'ArrowRight':
        next = (index + 1) % total
        break
      case 'ArrowLeft':
        next = (index - 1 + total) % total
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = total - 1
        break
      default:
        return
    }

    e.preventDefault()
    const nextTab = this.tabs[next]
    nextTab.focus()
    this.setActive(nextTab)
  }

  private scrollTabIntoView(newTab: TabElement, prevTab: TabElement): void {
    const container = this.tabList
    const containerWidth = container.clientWidth

    const newLeft = newTab.offsetLeft
    const newRight = newLeft + newTab.offsetWidth
    const prevLeft = prevTab.offsetLeft

    const direction = newLeft < prevLeft ? 'left' : 'right'

    const scrollTo = direction === 'left' ? newRight - containerWidth + 16 : newLeft - 16

    container.scrollTo({
      left: scrollTo,
      behavior: 'smooth'
    })
  }
}
