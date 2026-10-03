import { Directive, ElementRef, inject, signal } from '@angular/core';

/** Pointer travel in px before a press counts as a drag instead of a click. */
const DRAG_THRESHOLD = 5;

/**
 * Lets a mouse drag a horizontally scrolling strip, the way touch already
 * swipes it natively. Touch and pen are left alone. A press that moved more
 * than a few pixels swallows the following click, so dragging across a card
 * link doesn't open it.
 */
@Directive({
  selector: '[appDragScroll]',
  host: {
    '[class.is-dragging]': 'dragging()',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerUp($event)',
    '(dragstart)': '$event.preventDefault()',
  },
})
export class DragScroll {
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;

  /** True once the pointer moved past the threshold during the current press. */
  protected readonly dragging = signal(false);
  private pressed = false;
  private startX = 0;
  private startScroll = 0;

  constructor() {
    // Capture phase: runs before the routerLink on the card, so a drag
    // never navigates.
    this.el.addEventListener(
      'click',
      (event) => {
        if (!this.dragging()) return;
        event.preventDefault();
        event.stopPropagation();
        this.dragging.set(false);
      },
      true,
    );
  }

  /** Starts tracking a left-button mouse press. */
  protected onPointerDown(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    this.pressed = true;
    this.dragging.set(false);
    this.startX = event.clientX;
    this.startScroll = this.el.scrollLeft;
  }

  /** Scrolls the strip along with the mouse once the press became a drag. */
  protected onPointerMove(event: PointerEvent): void {
    if (!this.pressed) return;
    const dx = event.clientX - this.startX;
    if (!this.dragging() && Math.abs(dx) < DRAG_THRESHOLD) return;
    if (!this.dragging()) {
      this.dragging.set(true);
      this.el.setPointerCapture(event.pointerId);
    }
    this.el.scrollLeft = this.startScroll - dx;
  }

  /** Ends the press; `dragging` stays set until the click it causes is swallowed. */
  protected onPointerUp(event: PointerEvent): void {
    if (!this.pressed) return;
    this.pressed = false;
    if (this.el.hasPointerCapture(event.pointerId)) {
      this.el.releasePointerCapture(event.pointerId);
    }
    // No click follows a pointercancel, so clear the flag on the next tick.
    setTimeout(() => this.dragging.set(false));
  }
}
