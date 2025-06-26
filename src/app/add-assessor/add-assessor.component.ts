//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2025  Interneuron Limited

//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.

//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

//See the
//GNU General Public License for more details.

//You should have received a copy of the GNU General Public License
//along with this program.If not, see<http://www.gnu.org/licenses/>.
//END LICENSE BLOCK 
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Assessor } from '../models/assessor.model';
import { DataRequest } from '../services/datarequest.service';
import { Guid } from 'guid-typescript';
import { SubjectsService } from '../services/subjects.service';
import { Commissioner } from '../models/commissioner.model';
import { AppService } from '../services/app.service';
import { ApirequestService } from '../services/apirequest.service';

@Component({
  selector: 'app-add-assessor',
  templateUrl: './add-assessor.component.html',
  styleUrls: ['./add-assessor.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AddAssessorComponent implements OnInit {

  assessor: Assessor;
  commissionerList: Commissioner[] = [];
  checkAlphanumeric: boolean = false;
  assessorList: any;
  showAssessorAvailableMessage: boolean = false;
  showAssessorNotAvailableMessage: boolean = false;
  showAssessorErrorMessage: boolean = false;
  isLoading: boolean = false;

  @Input() editAssessorRecord: any;
  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;

  @ViewChild('validationAssessorModal', { static: false }) private validationAssessorModal;
  modalRef: NgbModalRef;

  constructor(private activeModal: NgbActiveModal, private dr: DataRequest,private subjects: SubjectsService,private modalService: NgbModal,private appService: AppService, private apiRequestService: ApirequestService,private changeDetector: ChangeDetectorRef) { 
    this.assessor = {} as Assessor;
    this.getNextAssessorIdentifier();
    this.assessor.disableliving_assessor_id = String(Guid.create());
    this.assessor.firstname = '';
    this.assessor.middlename = null;
    this.assessor.surname = '';
    this.assessor.phoneno = null;
    this.assessor.role = null;
    this.assessor.assessorid = null;
    this.assessor.provider = null;
    this.assessor.commissionerid = '';

    this.dr.getAssessorList((data)=> {
      this.assessorList =data;
    })

    this.dr.getCommissionerList((data)=> {
      this.commissionerList =data;
    })
  }

  private async getNextAssessorIdentifier()
  {
    let idnumberData = await this.apiRequestService.getRequest(`${this.appService.baseURI}/GetBaseViewList/bv_core_assessoridentifier`).toPromise();
    // console.log('idnumberData',JSON.parse(idnumberData)[0].assessoridentifier);
    if(!this.editAssessorRecord)
    {
      this.assessor.assessorid = JSON.parse(idnumberData)[0].assessoridentifier;
    }
  }

  ngOnInit(): void {
    // console.log('editAssessorRecord',this.editAssessorRecord);
    if(this.editAssessorRecord)
    {
      this.assessor.disableliving_assessor_id = this.editAssessorRecord.disableliving_assessor_id?this.editAssessorRecord.disableliving_assessor_id:String(Guid.create());
      this.assessor.firstname = this.editAssessorRecord.firstname;
      this.assessor.middlename = this.editAssessorRecord.middlename;
      this.assessor.surname = this.editAssessorRecord.surname;
      this.assessor.phoneno = this.editAssessorRecord.phoneno;
      this.assessor.role = this.editAssessorRecord.role;
      this.assessor.assessorid = this.editAssessorRecord.assessorid;
      this.assessor.provider = this.editAssessorRecord.provider;
      this.assessor.commissionerid = this.editAssessorRecord.commissionerid;
      this.assessor.assessorlocation = this.editAssessorRecord.assessorlocation;
      this.assessor.whatthreewords = this.editAssessorRecord.whatthreewords;
    }

    this.subjects.updateWhatThreeWords.subscribe(value => {
      this.assessor.whatthreewords = value['detail'];
      this.changeDetector.detectChanges();
    });
  }

  dismiss()
  {
    this.activeModal.dismiss();
  }

  saveAssessor()
  {
    
    // this.checkAssessorIdAvailability();

    if(this.assessor.firstname.trim() && this.assessor.surname.trim())
    {
      this.isLoading = true;
      // if(this.showAssessorNotAvailableMessage || this.assessor.assessorid == '' || this.assessor.assessorid == null)
      // {
        this.assessor.firstname = this.assessor.firstname.trim();
        this.assessor.middlename = this.assessor.middlename?this.assessor.middlename.trim():'';
        this.assessor.surname = this.assessor.surname.trim();
        this.assessor.createdon = this.appService.getDateTimeinISOFormat(new Date())
        this.assessor.createdby = this.appService.loggedInUserName;
        this.assessor.modifiedby = this.editAssessorRecord?this.appService.loggedInUserName: null;
        this.assessor.modifiedon = this.editAssessorRecord?this.appService.getDateTimeinISOFormat(new Date()): null;
        this.dr.createOrUpdateAssessor(this.assessor, (response) => {
          this.subjects.listAssessorChange.next(null);
          this.activeModal.dismiss();
          this.isLoading = false;
        });
      // }
      
    }
    else {
      this.open(this.validationAssessorModal);
      this.assessor.firstname = this.assessor.firstname.trim();
      this.assessor.surname = this.assessor.surname.trim()
      // this.isLoading = false;
    }
  }

  open(content) {
    this.modalRef = this.modalService.open(content, {size: 'dialog-centered', backdrop: 'static'});
  }

  closeValidationModal()
  {
    this.modalRef.close();
  }

  isAlphaNumeric(event)
  {
    this.showAssessorNotAvailableMessage = false;
    this.showAssessorAvailableMessage = false;
    this.showAssessorErrorMessage = false;
    var str = event.target.value;
    const alphanumericPattern = /^[a-zA-Z0-9]*$/;

    if(!alphanumericPattern.test(str))
    {
      this.checkAlphanumeric = true;
    }
    else {
      this.checkAlphanumeric = false;
    }
  }

  checkAssessorIdAvailability()
  {
    // console.log('assessorId',this.assessor.assessorid)
    // console.log('assessorList',this.assessorList)
    // console.log(this.assessorList.find(x => x.assessorid == this.assessor.assessorid));
    if(!this.checkAlphanumeric)
    {
      if(this.assessor.assessorid)
      {
        var checkAvailableAssessor = this.assessorList.filter(x => x.disableliving_assessor_id != this.assessor.disableliving_assessor_id).find(x => x.assessorid == this.assessor.assessorid);
        this.showAssessorErrorMessage = true;
        if(checkAvailableAssessor != undefined)
        {
          this.showAssessorAvailableMessage = true;
          this.showAssessorNotAvailableMessage = false;
        }
        else {
          this.showAssessorNotAvailableMessage = true;
          this.showAssessorAvailableMessage = false;
        }
      }
      else {
        this.showAssessorNotAvailableMessage = false;
        this.showAssessorAvailableMessage = false;
      }
    }
    
  }

  OpenWhatThreeWords()
  {
    this.subjects.openWhatThreeWords.next();
  }
}
