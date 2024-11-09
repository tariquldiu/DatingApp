import { Component, Input } from '@angular/core';
import { Member } from 'src/app/_models/member';

@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [],
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent {
  @Input() member!: Member; 
}
