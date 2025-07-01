import { Tabs } from './tabs'
import type { TabElement, TabsOptions } from './tabs.type'

type InitCallback = (tabs: Tabs) => void
type ChangeCallback = (args: { activeTab: TabElement; prevTab: TabElement | null }) => void
type DestroyCallback = (tabs: Tabs) => void

class TabsManager {
  public instances: Tabs[] = []

  private initListeners: InitCallback[] = []
  private changeListeners: ChangeCallback[] = []
  private destroyListeners: DestroyCallback[] = []

  private attachedHandlers = new WeakMap<Tabs, {
    onInit?: InitCallback
    onChange?: ChangeCallback
    onDestroy?: DestroyCallback
  }>()

  public register(instance: Tabs): void {
    if (this.instances.includes(instance)) return

    this.instances.push(instance)
    this.attachGlobalEvents(instance)
    this.triggerInit(instance)
  }

  public init(selector: string | HTMLElement, options?: TabsOptions): Tabs | null {
    const el =
      typeof selector === 'string' ? document.querySelector<HTMLElement>(selector) : selector

    if (!el) return null

    const exists = this.instances.find(tabs => tabs.container === el)
    if (exists) return exists

    const instance = options ? new Tabs(el, options) : new Tabs(el)
    return instance
  }

  public initAll(options?: TabsOptions): void {
    document.querySelectorAll<HTMLElement>('[data-tabs]').forEach(el => {
      this.init(el, options)
    })
  }

  public reinit(selector: string | HTMLElement, options?: TabsOptions): void {
    const instance = this.get(selector)
    if (!instance) return

    if (options) {
      instance.options = options
    }

    this.attachGlobalEvents(instance)
    instance.reinit()
  }

  public destroy(selector: string | HTMLElement): void {
    const instance = this.get(selector)
    if (!instance) return

    this.detachGlobalEvents(instance)
    instance.destroy()
    this.instances = this.instances.filter(t => t !== instance)
    this.triggerDestroy(instance)
  }

  public destroyAll(): void {
    [...this.instances].forEach(instance => {
      this.detachGlobalEvents(instance)
      instance.destroy()
      this.triggerDestroy(instance)
    })

    this.instances = []
    // this.clearListeners()
  }

  public getActive(selector: string | HTMLElement): TabElement | null {
    return this.get(selector)?.getActive() ?? null
  }

  public setActive(tabsSelector: string | HTMLElement, tab: string | TabElement | number): void {
    const instance = this.get(tabsSelector)
    if (instance) instance.setActive(tab)
  }

  public get(selector: string | HTMLElement): Tabs | null {
    const el =
      typeof selector === 'string' ? document.querySelector<HTMLElement>(selector) : selector

    return this.instances.find(tabs => tabs.container === el) ?? null
  }

  public onAnyInit(callback: InitCallback): void {
    this.initListeners.push(callback)
  }

  public onAnyChange(callback: ChangeCallback): void {
    this.changeListeners.push(callback)
  }

  public onAnyDestroy(callback: DestroyCallback): void {
    this.destroyListeners.push(callback)
  }

  public clearListeners(): void {
    this.initListeners = []
    this.changeListeners = []
    this.destroyListeners = []
  }

  private triggerInit(tabs: Tabs): void {
    this.initListeners.forEach(cb => cb(tabs))
  }

  private triggerChange(payload: { activeTab: TabElement; prevTab: TabElement | null }): void {
    this.changeListeners.forEach(cb => cb(payload))
  }

  private triggerDestroy(tabs: Tabs): void {
    this.destroyListeners.forEach(cb => cb(tabs))
  }

  private attachGlobalEvents(instance: Tabs): void {
    const userInit = instance.options.onInit
    const userChange = instance.options.onChange
    const userDestroy = instance.options.onDestroy

    const globalInit = (tabs: Tabs) => {
      userInit?.(tabs)
      this.triggerInit(tabs)
    }

    const globalChange = (payload: { activeTab: TabElement; prevTab: TabElement | null }) => {
      userChange?.(payload)
      this.triggerChange(payload)
    }

    const globalDestroy = (tabs: Tabs) => {
      userDestroy?.(tabs)
      this.triggerDestroy(tabs)
    }

    instance.options.onInit = globalInit
    instance.options.onChange = globalChange
    instance.options.onDestroy = globalDestroy

    this.attachedHandlers.set(instance, {
      onInit: globalInit,
      onChange: globalChange,
      onDestroy: globalDestroy
    })
  }

  private detachGlobalEvents(instance: Tabs): void {
    const handlers = this.attachedHandlers.get(instance)
    if (!handlers) return

    instance.options.onInit = undefined
    instance.options.onChange = undefined
    instance.options.onDestroy = undefined

    this.attachedHandlers.delete(instance)
  }
}

export const TabsManagerApi = new TabsManager()

export const TabsApi = {
  getActive: TabsManagerApi.getActive.bind(TabsManagerApi),
  init: TabsManagerApi.init.bind(TabsManagerApi),
  initAll: TabsManagerApi.initAll.bind(TabsManagerApi),
  reinit: TabsManagerApi.reinit.bind(TabsManagerApi),
  destroy: TabsManagerApi.destroy.bind(TabsManagerApi),
  destroyAll: TabsManagerApi.destroyAll.bind(TabsManagerApi),
  clearListeners: TabsManagerApi.clearListeners.bind(TabsManagerApi),
  get: TabsManagerApi.get.bind(TabsManagerApi),
  setActive: TabsManagerApi.setActive.bind(TabsManagerApi),
  onAnyInit: TabsManagerApi.onAnyInit.bind(TabsManagerApi),
  onAnyChange: TabsManagerApi.onAnyChange.bind(TabsManagerApi),
  onAnyDestroy: TabsManagerApi.onAnyDestroy.bind(TabsManagerApi),
  get instances(): Tabs[] {
    return TabsManagerApi.instances
  }
}
