import { Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import { CommonModule, DecimalPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Member } from 'src/app/_models/member';
import { FileUploader, FileUploadModule } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';
import { AccountService } from 'src/app/_services/account.service';

@Component({
  selector: 'app-photo-editor',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, NgStyle, NgClass, FileUploadModule, DecimalPipe],
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit{
  private accountService = inject(AccountService);
  @Input() member!: Member; 
  @Output() memberChange = new EventEmitter<Member>(); 
  uploader?: FileUploader
  hasBaseDropZoneOver = false;
  baseUrl = environment.apiUrl;

  ngOnInit(): void{
    this.initializeUploader();
  }

  fileOverBase(e: any){
   this.hasBaseDropZoneOver = e;
  }

  initializeUploader(){
    this.uploader = new FileUploader({
        url: this.baseUrl + 'users/add-photo',
        authToken: 'Bearer ' + this.accountService.currentUser()?.token,
        isHTML5:true,
        allowedFileType: ['image'],
        removeAfterUpload: true,
        autoUpload: false,
        maxFileSize: 10 * 1024 * 1024

    });


    this.uploader.onAfterAddingFile = (file) =>{
      file.withCredentials = true;
    }

    this.uploader.onSuccessItem = (item, response, status, header) =>{
         const photo = JSON.parse(response);
         const updatedMember = {...this.member}
         updatedMember.photos.push(photo);
         this.memberChange.emit(updatedMember);
    }
  }

}
