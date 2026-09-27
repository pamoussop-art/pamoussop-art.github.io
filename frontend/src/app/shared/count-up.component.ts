import { Component, OnDestroy, effect, input, signal, untracked } from '@angular/core';

/** Chiffre qui compte de 0 jusqu'à sa valeur (et se met à jour si la valeur change). */
@Component({
  selector: 'app-count-up',
  template: `{{ shown() }}`,
})
export class CountUpComponent implements OnDestroy {
  readonly to = input.required<number>();
  readonly delay = input(700);
  protected readonly shown = signal(0);
  private raf = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    effect(() => {
      const target = this.to();
      const from = untracked(() => this.shown());
      cancelAnimationFrame(this.raf);
      clearTimeout(this.timer);
      const wait = from === 0 ? untracked(() => this.delay()) : 0;
      this.timer = setTimeout(() => this.animate(from, target), wait);
    });
  }

  private animate(from: number, to: number): void {
    const start = performance.now();
    const duration = 1400;
    const step = (now: number) => {
      const x = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - x, 3);
      this.shown.set(Math.round(from + (to - from) * eased));
      if (x < 1) this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.timer);
  }
}
