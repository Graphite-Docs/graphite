import React, { Component } from "react";

export default class RoleTable extends Component {

  render(){
      return(
        <table className="bordered">
          <thead>
            <tr>
                <th></th>
                <th>Owner</th>
                <th>Administrator</th>
                <th>Manager</th>
                <th>User</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Manage Main Storage Hub</td>
              <td>X</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Add Teammates</td>
              <td>X</td>
              <td>X</td>
              <td>X</td>
              <td></td>
            </tr>
            <tr>
              <td>Update Teammate Roles</td>
              <td>X</td>
              <td>X</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Delete Teammates</td>
              <td>X</td>
              <td>X</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Add Integrations</td>
              <td>X</td>
              <td>X</td>
              <td>X</td>
              <td></td>
            </tr>
            <tr>
              <td>Delete Integrations</td>
              <td>X</td>
              <td>X</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Access Audit Logs</td>
              <td>X</td>
              <td>X</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Share Documents To Team</td>
              <td>X</td>
              <td>X</td>
              <td>X</td>
              <td>X</td>
            </tr>
            <tr>
              <td>Real-Time Document Collaboration</td>
              <td>X</td>
              <td>X</td>
              <td>X</td>
              <td>X</td>
            </tr>
            <tr>
              <td>Download Team Documents</td>
              <td>X</td>
              <td>X</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Share Team Documents Outside Team</td>
              <td>X</td>
              <td>X</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>View Account Settings</td>
              <td>X</td>
              <td>X</td>
              <td>X</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      )
  }
}
