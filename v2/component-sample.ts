import { Component, ElementRef, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { closest, clamp } from './../helpers';
import { SelectMenuOption } from './../interfaces/select-menu';

@Component({
  selector: 'calculator',
  template: `
    <button type="button" class="minus" (click)="decrement($event)">-</button>
    <input type="text" [value]="value" (keyup)="onKeyUp($event)"/>
    <button type="button" class="plus" (click)="increment($event)">+</button>
  `,
  host: {

  }
})

export class CalculatorComponent {

  input: HTMLInputElement;

  @Input('value') value: number;
  @Input('min') min: number;
  @Input('max') max: number;
  @Input('step') step: number;

  @Output() onchange: EventEmitter<any> = new EventEmitter();

  constructor(private el: ElementRef){

  }

  ngAfterContentInit(){
    this.value = this.value || 1;
    this.min = this.min || 1;
    this.max = this.max || 99;
    this.step = this.step || 1;

    this.input = this.el.nativeElement.querySelector('input');
  }

  setValue(newValue: number){
    this.value = clamp(newValue, this.min, this.max);
    this.onchange.emit({
      value: this.value
    });
  }

  onKeyUp(e: any){
    this.setValue(parseInt(e.target.value) || 1);
  }

  decrement(e: Event) {
    e.preventDefault();
    this.setValue(this.value - this.step);
  }

  increment(e: Event){
    e.preventDefault();
    this.setValue(this.value + this.step);
  }

}
