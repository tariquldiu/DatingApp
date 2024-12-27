import { Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Member } from 'src/app/_models/member';

@Component({
  selector: 'app-photo-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent {
  @Input() member!: Member; 
}
