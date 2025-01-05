import { Component, Input, Self } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, BsDatepickerModule, NgIf, ReactiveFormsModule],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent implements ControlValueAccessor{

  @Input() label: string ='';
  @Input() maxDate!: Date;
  bsConfig: Partial<BsDatepickerConfig>;
  
 
  constructor(@Self() public ngControl: NgControl ) {
    this.ngControl.valueAccessor = this
    this.bsConfig = {
      containerClass:'theme-red',
      dateInputFormat: 'DD MMMM YYYY'
    }
  }

  writeValue(obj: any): void {
  }
  registerOnChange(fn: any): void {
  }
  registerOnTouched(fn: any): void {
  }
  
  get control(): FormControl{
    return this.ngControl.control as FormControl
  }
}
