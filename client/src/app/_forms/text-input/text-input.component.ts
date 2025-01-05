import { Component, Input, Self } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.css']
})
export class TextInputComponent implements ControlValueAccessor{
  @Input() label:string = '' ; 
  @Input() type:string = 'text';

  constructor(@Self() public ngControl: NgControl) {
   this.ngControl.valueAccessor = this
    
  }

  writeValue(obj: any): void {
  }
  registerOnChange(fn: any): void {
  }
  registerOnTouched(fn: any): void {
  }

  get control() : FormControl{
    return this.ngControl.control as FormControl
  }
 
}
