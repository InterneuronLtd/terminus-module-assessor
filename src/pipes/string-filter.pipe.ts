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
import { Pipe } from "@angular/core";

@Pipe({
  name: 'stringFilter'
})
export class StringFilterPipe {

  transform(value: any, q: string) {
    if (!q || q === '') {
      return value;
    }

    // let strArray: string[] = [];

    let rtArray: object[] = [];

    // value.map(
    //   (item) => {
    //     strArray.push(JSON.stringify(item));
    //   }
    // )
    value.filter(item => (item.firstname.toLowerCase().includes(q.toLowerCase())) || 
    (item.middlename != null && item.middlename.toLowerCase().includes(q.toLowerCase())) || 
    (item.surname.toLowerCase().includes(q.toLowerCase())) || 
    (item.assessorid.toLowerCase().includes(q.toLowerCase())) || 
    (item.phoneno != null && item.phoneno.toLowerCase().includes(q.toLowerCase())) || 
    (item.role != null && item.role.toLowerCase().includes(q.toLowerCase())))
      .map(
        (item) => {
          rtArray.push(item);
        }
      );
      return rtArray;
  }
}
