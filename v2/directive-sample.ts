import { Directive, ElementRef, Input } from '@angular/core';
import { closest } from './../helpers';

let dropdownInstances: any = [];

@Directive({ selector: '[data-dropdown]' })


export class DataDropdownDirective {

  anchor: HTMLElement;
  isDropdownOpened: boolean;

  constructor(private el: ElementRef) {
    this.isDropdownOpened = false;
    dropdownInstances.push(this);
  }

  ngAfterContentInit() {
    this.anchor = this.el.nativeElement.querySelector('.anchor');
    document.addEventListener('click', (e: Event)=> {
      if (!closest(e.target, "[data-dropdown]")){
        this.isDropdownOpened = false;
        this.updateClassName();
      }
    });
    [].map.call(this.el.nativeElement.querySelectorAll('[data-dismiss]'), (node: any, i: number)=> {
      node.addEventListener('click', (e: Event)=> {
        console.log('d')
        this.toggleDropdown();
      });
    });
  }

  ngAfterViewInit() {
    if (this.anchor) {
      this.anchor.addEventListener('click', (e: Event)=> {
        e.preventDefault();
        this.toggleDropdown();
      });
    }
  }

  toggleDropdown(){
    this.isDropdownOpened = !this.isDropdownOpened;
    this.updateClassName();
  }

  updateClassName(){
    dropdownInstances.map((dropdown: any) => {
      if (this.el.nativeElement != dropdown.el.nativeElement) {
        dropdown.el.nativeElement.classList.remove('opened');
        dropdown.isDropdownOpened = false;
      }
    });
    if (this.isDropdownOpened){
      this.el.nativeElement.classList.add('opened');
    } else {
      this.el.nativeElement.classList.remove('opened');

    }
  }

}
