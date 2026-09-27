import { Component, HostListener, input, output } from '@angular/core';
import { IconComponent } from '../shared/icon.component';

/** Fenêtre de formulaire (ajout / modification). */
@Component({
  selector: 'app-modal',
  imports: [IconComponent],
  template: `
    @if (open()) {
      <div class="backdrop" aria-hidden="true"></div>
      <div class="wrap" role="dialog" aria-modal="true" [attr.aria-label]="title()">
        <div class="box">
          <div class="head">
            <h2 class="disp">{{ title() }}</h2>
            <button type="button" class="x" (click)="closed.emit()" aria-label="Fermer"><app-icon name="close" [size]="16" [stroke]="2.2" /></button>
          </div>
          <ng-content />
        </div>
      </div>
    }
  `,
  styles: `
    .backdrop { position: fixed; inset: 0; z-index: 80; background: rgba(3,6,14,.7); backdrop-filter: blur(6px); animation: fade .3s both; }
    .wrap { position: fixed; inset: 0; z-index: 81; overflow-y: auto; display: flex; justify-content: center; align-items: flex-start; padding: 60px 16px; }
    .box { width: min(620px, 100%); padding: 32px; background: var(--card); border: 1px solid var(--line2); border-radius: 26px; display: flex; flex-direction: column; gap: 18px; box-shadow: 0 40px 90px -30px rgba(0,0,0,.8); animation: pop .45s cubic-bezier(.2,.7,.2,1) both; }
    .head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    h2 { font-size: 24px; font-weight: 700; }
    .x { width: 38px; height: 38px; border-radius: 10px; border: 1px solid var(--line2); background: transparent; color: var(--tx2); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
    .x:hover { border-color: var(--ac); color: var(--tx); background: var(--acs); }
    @media (max-width: 560px) { .box { padding: 22px; } .wrap { padding: 20px 10px; } }
  `,
})
export class ModalComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.open()) this.closed.emit();
  }
}

/** En-tête de page admin avec bouton d'ajout optionnel. */
@Component({
  selector: 'app-page-head',
  imports: [IconComponent],
  template: `
    <div class="head">
      <div>
        <h1 class="disp">{{ title() }}</h1>
        <p>{{ subtitle() }}</p>
      </div>
      @if (addLabel()) {
        <button type="button" class="btn btn-p btn-sm" (click)="add.emit()"><app-icon name="plus" [size]="18" [stroke]="2.4" />{{ addLabel() }}</button>
      }
    </div>
  `,
  styles: `
    .head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; animation: up .5s cubic-bezier(.2,.7,.2,1) both; }
    h1 { font-size: 30px; font-weight: 700; }
    p { color: var(--mu); margin-top: 6px; }
  `,
})
export class PageHeadComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly addLabel = input('');
  readonly add = output<void>();
}

/** Petits boutons d'action (monter, descendre, modifier, supprimer). */
@Component({
  selector: 'app-row-actions',
  imports: [IconComponent],
  template: `
    <div class="acts">
      <button type="button" class="ib" (click)="up.emit()" [disabled]="first()" aria-label="Monter"><app-icon name="chevUp" [size]="16" /></button>
      <button type="button" class="ib" (click)="down.emit()" [disabled]="last()" aria-label="Descendre"><app-icon name="chevDown" [size]="16" /></button>
      <button type="button" class="ib" (click)="edit.emit()" aria-label="Modifier"><app-icon name="edit" [size]="16" /></button>
      <button type="button" class="ib del" (click)="remove.emit()" aria-label="Supprimer"><app-icon name="trash" [size]="16" /></button>
    </div>
  `,
  styles: `
    .acts { display: flex; gap: 6px; }
    .ib { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--line2); background: transparent; color: var(--tx2); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all .25s; }
    .ib:hover:not(:disabled) { border-color: var(--ac); color: var(--tx); background: var(--acs); }
    .ib.del:hover { border-color: var(--red); color: var(--red); background: var(--redbg); }
    .ib:disabled { opacity: .35; cursor: default; }
  `,
})
export class RowActionsComponent {
  readonly first = input(false);
  readonly last = input(false);
  readonly up = output<void>();
  readonly down = output<void>();
  readonly edit = output<void>();
  readonly remove = output<void>();
}
