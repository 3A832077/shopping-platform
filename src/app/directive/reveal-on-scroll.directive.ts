import { Directive, ElementRef, AfterViewInit, OnDestroy, Renderer2, Input } from '@angular/core';

@Directive({
  selector: '[appRevealOnScroll]',
  standalone: true
})
export class RevealOnScrollDirective implements AfterViewInit, OnDestroy {

  private observer: IntersectionObserver | undefined;

  @Input('appRevealOnScrollDelay') delay: number = 0;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    this.renderer.addClass(this.el.nativeElement, 'reveal');

    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 當元素進入可視範圍時，加上 visible class 來觸發動畫
          setTimeout(() => {
            this.renderer.addClass(this.el.nativeElement, 'visible');
          }, this.delay);
        }
        else {
          // 當元素離開可視範圍時，移除 visible class 來重置動畫
          // 這樣下次滑入時才能再次觸發
          this.renderer.removeClass(this.el.nativeElement, 'visible');
        }
      });
    }, {
      threshold: 0.1 // 元素進入可視範圍 10% 時觸發
    });

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
