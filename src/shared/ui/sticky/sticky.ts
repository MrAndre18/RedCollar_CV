export class StickyManager {
  private header: HTMLElement | null = null;
  private stickyElements: HTMLElement[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private rafId: number | null = null;
  private lastHeaderHeight: number = 0;

  private constructor() { }

  static #instance: StickyManager | null = null;

  static init(): StickyManager {
    if (this.#instance) {
      this.#instance.destroy();
    }
    const manager = new StickyManager();
    manager._init();
    this.#instance = manager;
    return manager;
  }

  static destroy() {
    this.#instance?.destroy();
    this.#instance = null;
  }

  private _init() {
    this.header = document.querySelector<HTMLElement>('[data-header="body"]');
    if (!this.header) {
      console.warn('[StickyAdjust] Header не найден по [data-header="body"]');
      return;
    }

    this.stickyElements = Array.from(document.querySelectorAll<HTMLElement>('[data-sticky]'));
    this.updateStickyPositions();

    this.resizeObserver = new ResizeObserver(() => this.updateStickyPositions());
    this.resizeObserver.observe(this.header);

    this.mutationObserver = new MutationObserver(() => this.updateStickyPositions());
    this.mutationObserver.observe(this.header, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'style', 'hidden'],
    });

    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.handleResize);

    this.startLoop();
  }

  destroy() {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    this.header = null;
    this.stickyElements = [];
    this.resizeObserver = null;
    this.mutationObserver = null;
    this.stopLoop();
  }

  private updateStickyPositions(force = false) {
    if (!this.header) return;

    const headerRect = this.header.getBoundingClientRect();
    const headerHeight = headerRect.height;
    if (!force && this.lastHeaderHeight === headerHeight) return;
    this.lastHeaderHeight = headerHeight;

    this.stickyElements.forEach((el) => {
      el.style.top = `${headerHeight}px`;

      if (el.hasAttribute('data-sticky-auto-height')) {
        // Смотрим, совпадает ли top блока с headerHeight
        const elRect = el.getBoundingClientRect();
        const stickyTop = elRect.top;
        // Пока sticky не встал под хедер, пересчитываем на каждом скролле
        if (stickyTop !== headerHeight) {
          window.addEventListener('scroll', this.handleScrollSticky, { passive: true });
        } else {
          window.removeEventListener('scroll', this.handleScrollSticky);
        }

        // Стандартный расчет maxHeight
        const maxHeightByViewport = window.innerHeight - stickyTop;
        let maxHeightByParent = Infinity;
        const parent = el.offsetParent as HTMLElement | null;
        if (parent) {
          const parentRect = parent.getBoundingClientRect();
          const parentBottomInViewport = parentRect.bottom;
          maxHeightByParent = parentBottomInViewport - stickyTop;
        }
        const finalMaxHeight = Math.max(0, Math.min(maxHeightByViewport, maxHeightByParent));

        if (el.style.maxHeight !== `${finalMaxHeight}px`) {
          el.style.maxHeight = `${finalMaxHeight}px`;
        }
        el.style.overflow = 'auto';
      }
    });
  }

  private handleScrollSticky = () => {
    this.updateStickyPositions(true);
  }

  private startLoop() {
    const loop = () => {
      this.updateStickyPositions();
      this.rafId = requestAnimationFrame(loop);
    };
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(loop);
    }
  }

  private stopLoop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private handleScroll = () => {
    // just keep loop running — it's always active anyway
  };

  private handleResize = () => {
    this.updateStickyPositions();
  };
}
