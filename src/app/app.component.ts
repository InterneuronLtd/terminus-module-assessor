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
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../environments/environment';
import { AppService } from './services/app.service';
import { SubjectsService } from './services/subjects.service';
import { ApirequestService } from './services/apirequest.service';
import { DataRequest } from './services/datarequest.service';
import { DataContract, action, filter, filterParams, filterparam, filters, orderbystatement, selectstatement } from './models/filter.model';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AddAssessorService } from './add-assessor/add-assessor.service';
import { Assessor } from './models/assessor.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'terminus-module-assessor';
  closeResult: string = '';
  assessorList: Assessor[]=[];
  isLoading: boolean = false;
  deleteAssessorId: string;
  filter: string = "";
  subscriptions: Subscription = new Subscription();

  @ViewChild('deleteAssessorModal', { static: false }) private deleteAssessorModal;

  @Input() set datacontract(value: DataContract) {
    this.appService.personId = value.personId;
    this.appService.apiService = value.apiService;
    this.subjects.unload = value.unload;
    this.initAppService(value);
    this.initConfigAndGetMeta(this.appService.apiService)
  }
  @Output() frameworkAction = new EventEmitter<string>();
  constructor(private subjects: SubjectsService,public appService: AppService, private apiRequest: ApirequestService, private dr: DataRequest, private modalService: NgbModal,private addAssessorService: AddAssessorService,) {
    this.subscriptions.add(this.subjects.frameworkEvent.subscribe((e: string) => { this.emitFrameworkEvent(e) }
    ));
    // console.log(environment.production);
    if (!environment.production)
      this.initDevMode();
  }
  emitFrameworkEvent(e: string) {    
    this.frameworkAction.emit(e);
  }
  initDevMode() {
   
    let value: any = {};
    value.authService = {};
    value.authService.user = {};
    let auth = this.apiRequest.authService;
    auth.getToken().then((token) => {
      value.authService.user.access_token = token;
      this.initConfigAndGetMeta(value);
    });

  }
  async initConfigAndGetMeta(value: any) {
    this.isLoading = true;
    this.appService.apiService = value;
    let decodedToken: any;
    if (this.appService.apiService) {
      decodedToken = this.appService.decodeAccessToken(this.appService.apiService.authService.user.access_token);
      if (decodedToken != null)
        this.appService.loggedInUserName = decodedToken.name ? (Array.isArray(decodedToken.name) ? decodedToken.name[0] : decodedToken.name) : decodedToken.IPUId;

    }
    await this.subscriptions.add(this.apiRequest.getRequest("./assets/config/assessor-config.json?V" + Math.random()).subscribe(
      async (response) => {
        this.appService.appConfig = response;
        this.appService.baseURI = this.appService.appConfig.uris.baseuri;
        this.appService.enableLogging = this.appService.appConfig.enablelogging;
        //get actions for rbac
        await this.subscriptions.add(this.apiRequest.postRequest(`${this.appService.baseURI}/GetBaseViewListByPost/rbac_actions`, this.createRoleFilter(decodedToken))
          .subscribe((response: action[]) => {
            this.appService.roleActions = response;
            this.appService.logToConsole(response);
            this.listAssessor();
          }));
      }));
  }

  async initAppService(value: any) {
    if (value.moduleAction)
      this.subscriptions.add(value.moduleAction.subscribe((e) => {
        this.ModuleAction(e);
      }));
  }

  ngOnInit()
  {
    this.subjects.listAssessorChange.subscribe(value => {
      this.listAssessor();
    });

    this.subjects.openWhatThreeWords.subscribe(value => {
      this.frameworkAction.emit("OPEN_W3W");
    });
  }

  
  createRoleFilter(decodedToken: any) {

    let condition = "";
    let pm = new filterParams();
    let synapseroles;
    if (environment.production)
      synapseroles = decodedToken.SynapseRoles
    else
      synapseroles = decodedToken.client_SynapseRoles
    if (!Array.isArray(synapseroles)) {
      condition = "rolename = @rolename";
      pm.filterparams.push(new filterparam("rolename", synapseroles));
    }
    else
      for (var i = 0; i < synapseroles.length; i++) {
        condition += "or rolename = @rolename" + i + " ";
        pm.filterparams.push(new filterparam("rolename" + i, synapseroles[i]));
      }
    condition = condition.replace(/^\or+|\or+$/g, '');
    let f = new filters();
    f.filters.push(new filter(condition));


    let select = new selectstatement("SELECT *");

    let orderby = new orderbystatement("ORDER BY 1");

    let body = [];
    body.push(f);
    body.push(pm);
    body.push(select);
    body.push(orderby);

    this.appService.logToConsole(JSON.stringify(body));
    return JSON.stringify(body);
  }

  async addAssessor()
  {
    var response = false;
    await this.addAssessorService.confirm('','Create Assessor Record','','Import')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
    else {
     // await this.getSelectedFormWithContext();
    }
  }

  async editAssessor(assessorData)
  {
    var response = false;
    await this.addAssessorService.confirm(assessorData,'Edit Assessor Record','','Import')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
    else {
     // await this.getSelectedFormWithContext();
    }
  }

  listAssessor()
  {
    this.filter = '';
    this.dr.getAssessorList((data)=> {
      this.assessorList = data.sort((d1, d2) => d1['surname'].localeCompare(d2['surname']) || d1['firstname'].localeCompare(d2['firstname']));
      this.isLoading = false;
    })
  }

  confirmDeleteAssessor(deleteassessorData)
  {
    this.open(this.deleteAssessorModal);
    this.deleteAssessorId = deleteassessorData.disableliving_assessor_id
  }

  deleteAssessor(confirm)
  {
    if(confirm)
    {
      this.dr.deleteAssessor(this.deleteAssessorId, (response) => {
        this.subjects.listAssessorChange.next(null);
      })
    }
    this.modalService.dismissAll();
  }

  open(content) {
    this.modalService.open(content, {size: 'dialog-centered', backdrop: 'static'}).result.then((result) => {
    }, (reason) => {
    });
  }

  ModuleAction(e) {
    console.log(e)
    if (e.type == "w3w") {
      this.subjects.updateWhatThreeWords.next(e.data);
    }
  }

  ngOnDestroy() {
    this.appService.logToConsole("app component being unloaded");
    this.appService.encounter = null;
    this.appService.personId = null;
    this.appService.isCurrentEncouner = null;
    this.appService.reset();
    this.subscriptions.unsubscribe();
    this.subjects.unload.next("app-assessors");
  }
}
