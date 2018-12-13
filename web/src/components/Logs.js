import React, { Component } from "react";

export default class Logs extends Component {


  render() {
    const { audits } = this.props;
    let auditHistory;
    console.log(audits);
    if(audits) {
      auditHistory = audits;
    } else {
      auditHistory = []
    }

    return (
      <div className="modal-content">
        <h4>Search Audits</h4>
        <ul>
        {
          auditHistory.map(audit => {
            return(
              <li key={audit.id} className="audits"><strong>{audit.timeStamp}</strong>
                <ul>
                  <li>User: {audit.user}</li>
                  <li>Action: {audit.action}</li>
                </ul>
              </li>
            )

          })
        }
        </ul>
        </div>
    );
  }
}
