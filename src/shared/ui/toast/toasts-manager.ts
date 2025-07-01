import { Toast } from './toast'
import { parseToastOptionsFromElement } from './toast.utils'
import { ToastEvent, type ToastOptions } from './toast.type'

type ToastInitArg =
  | string
  | HTMLElement
  | (ToastOptions & { node?: HTMLElement; closeElement?: string | HTMLElement });

class ToastManager {
  private instances: Toast[] = [];
  private active: Toast[] = [];
  public maxVisible = 3;

  // Хелпер для клонирования node (если надо)
  private cloneNodeIfNeeded(node?: HTMLElement): HTMLElement | undefined {
    return node ? (node.cloneNode(true) as HTMLElement) : undefined;
  }

  // Получить toast-инстанс по node (клон всегда считается отдельным!)
  public get(target: string | HTMLElement): Toast | undefined {
    return this.instances.find(t => {
      const node = t.options.node;
      if (!node) return false;
      if (typeof target === 'string') return node.matches(target);
      // isEqualNode, чтобы матчить даже клоны с теми же шаблонами
      return node.isEqualNode(target);
    });
  }

  // Универсальный парсер опций для инициализации
  private parseOptions(arg: ToastInitArg): ToastOptions & { node?: HTMLElement; closeElement?: string | HTMLElement } {
    if (typeof arg === 'string' || arg instanceof HTMLElement) {
      const el = typeof arg === 'string' ? document.querySelector<HTMLElement>(arg) : arg;
      if (!el) throw new Error(`[Toast Manager] Element not found: ${arg}`);
      // Клонируем всегда!
      return { ...parseToastOptionsFromElement(el), node: el.cloneNode(true) as HTMLElement };
    }
    // Если node есть, обязательно клон
    return {
      ...arg,
      node: arg.node instanceof HTMLElement ? arg.node.cloneNode(true) as HTMLElement : undefined,
    };
  }

  // Инициализация (создание нового инстанса всегда с клоном node)
  public init(arg: ToastInitArg): Toast {
    const options = this.parseOptions(arg);
    // Каждый init — это всегда новый Toast!
    const inst = new Toast(options);
    this.instances.push(inst);
    return inst;
  }

  // Показывает новый Toast (каждый раз отдельный инстанс, отдельный клон node)
  public show(arg: ToastInitArg): void {
    const inst = this.init(arg);

    // Если лимит — убираем самый старый active
    if (this.active.length >= this.maxVisible) {
      const oldest = this.active.shift();
      oldest?.hide();
    }

    // На скрытие — удаляем из active (и не только по автоскрытию, но и по свайпу/крестику)
    const userOnHidden = inst.options.onHidden;
    inst.options.onHidden = (toast) => {
      const idx = this.active.indexOf(inst);
      if (idx !== -1) this.active.splice(idx, 1);
      userOnHidden?.(toast);
    };

    inst.show();
    this.active.push(inst);
  }

  public hide(target: string | HTMLElement): void {
    this.get(target)?.hide();
  }

  public reinit(
    target: string | HTMLElement,
    newOptions: ToastOptions & { closeElement?: string | HTMLElement }
  ): Toast {
    const existing = this.get(target);
    if (!existing) throw new Error('[Toast Manager] Instance not found for reinit');

    const node = existing.options.node;
    if (!node) throw new Error('[Toast Manager] Cannot reinit without node');

    node.removeAttribute('data-toast-init');
    const idx = this.instances.indexOf(existing);
    if (idx > -1) this.instances.splice(idx, 1);

    // При реинициализации тоже всегда клон!
    const opts = {
      ...existing.options,
      ...newOptions,
      node: node.cloneNode(true) as HTMLElement,
      closeElement: newOptions.closeElement ?? existing.options.closeElement,
    };

    return this.init(opts);
  }

  public destroy(target: string | HTMLElement): void {
    const toast = this.get(target);
    if (!toast) return;
    toast.destroy();
    const idx = this.instances.indexOf(toast);
    if (idx > -1) this.instances.splice(idx, 1);
    const activeIdx = this.active.indexOf(toast);
    if (activeIdx > -1) this.active.splice(activeIdx, 1);
  }

  public destroyAll(): void {
    this.instances.slice().forEach(t => t.destroy());
    this.instances = [];
    this.active = [];
  }

  public initAll(): void {
    document.querySelectorAll<HTMLElement>('[data-toast]').forEach(el => this.init(el));
  }

  public onAnyInit(cb: (inst: Toast) => void): () => void {
    const h = (e: Event) => cb((e as CustomEvent<{ instance: Toast }>).detail.instance);
    document.addEventListener(ToastEvent.GlobalInit, h);
    return () => document.removeEventListener(ToastEvent.GlobalInit, h);
  }

  public onAnyOpen(cb: (inst: Toast) => void): () => void {
    const h = (e: Event) => cb((e as CustomEvent<{ instance: Toast }>).detail.instance);
    document.addEventListener(ToastEvent.GlobalOpen, h);
    return () => document.removeEventListener(ToastEvent.GlobalOpen, h);
  }

  public onAnyClose(cb: (inst: Toast) => void): () => void {
    const h = (e: Event) => cb((e as CustomEvent<{ instance: Toast }>).detail.instance);
    document.addEventListener(ToastEvent.GlobalClose, h);
    return () => document.removeEventListener(ToastEvent.GlobalClose, h);
  }
}

export const toastApi = new ToastManager();
