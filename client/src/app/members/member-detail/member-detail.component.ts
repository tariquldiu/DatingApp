import { Component, inject, OnInit } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { MemberService } from 'src/app/_services/member.service';
import { Member } from 'src/app/_models/member';
import { ActivatedRoute } from '@angular/router';
import { NgImageSliderModule } from 'ng-image-slider';


@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [TabsModule, NgImageSliderModule],
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {

  private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  member?:Member;
  imageObject: Array<object> = [];

  ngOnInit(){
    this.loadMember();
  }

  loadMember()
  {


    const username = this.route.snapshot.paramMap.get('username');
    if(!username)return;

    this.memberService.getMember(username).subscribe({
      next: member =>{
        this.member = member;
        member.photos.map((p, index) => {
          this.imageObject.push({image:p.url, thumbImage: p.url, alt: member.knownAs, title: (index +1) + ': ' + member.knownAs})
        }
        )
      } 
    })
      
   }
}
