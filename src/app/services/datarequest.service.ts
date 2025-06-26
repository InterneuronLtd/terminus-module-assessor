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
import { Injectable, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { Assessor } from "../models/assessor.model";
import { ApirequestService } from "./apirequest.service";
import { AppService } from "./app.service";
import { Commissioner } from "../models/commissioner.model";

@Injectable({
    providedIn: 'root'
})

export class DataRequest implements OnDestroy {
    subscriptions = new Subscription();
    constructor(private apiRequest: ApirequestService, private appService: AppService) {

    }
    getAssessorList(cb: (data) => any) {
        this.subscriptions.add(this.apiRequest.getRequest(this.appService.baseURI + "/GetList?synapsenamespace=local&synapseentityname=disableliving_assessor").subscribe(
            (response) => {
                let responseArray: Assessor[] = JSON.parse(response);
                cb(responseArray);
            }
        ));
    }
    createOrUpdateAssessor(assessor: Assessor,cb: (data) => any) {
        this.subscriptions.add(this.apiRequest.postRequest(this.appService.baseURI + "/PostObject?synapsenamespace=local&synapseentityname=disableliving_assessor", JSON.stringify(assessor)).subscribe(
            (response) => {                
                cb(response);
            }
        ));
    }
    deleteAssessor(disableliving_assessor_id,cb: (data) => any) {
        this.subscriptions.add(this.apiRequest.deleteRequest(this.appService.baseURI + "/DeleteObject?synapsenamespace=local&synapseentityname=disableliving_assessor&id=" + disableliving_assessor_id).subscribe(
            (response) => {                
                cb(response);
            }
        ));
    }
    getCommissionerList(cb: (data) => any) {
        this.subscriptions.add(this.apiRequest.getRequest(this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=commissioner").subscribe(
            (response) => {
                let responseArray: Commissioner[] = JSON.parse(response);
                cb(responseArray);
            }
        ));
    }
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}

