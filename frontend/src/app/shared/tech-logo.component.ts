import { Component, computed, input, signal } from '@angular/core';
import { deviconUrl, monogram } from '../core/logic';

/** Logo officiel d'une technologie (Devicon), ou ses initiales si le logo n'existe pas. */
@Component({
  selector: 'app-tech-logo',
  template: `
    @if (url() && !failed()) {
      <span class="logo-box" [style.width.px]="size()" [style.height.px]="size()">
        <img [src]="url()" alt="" [style.width.px]="size() * 0.6" [style.height.px]="size() * 0.6" loading="lazy" (error)="failed.set(true)" />
      </span>
    } @else {
      <span class="mg" [style.width.px]="size()" [style.height.px]="size()" aria-hidden="true">{{ initials() }}</span>
    }
  `,
})
export class TechLogoComponent {
  readonly icon = input('');
  readonly name = input('');
  readonly size = input(46);
  protected readonly failed = signal(false);
  protected readonly url = computed(() => deviconUrl(this.icon()));
  protected readonly initials = computed(() => monogram(this.name() || this.icon()));
}
