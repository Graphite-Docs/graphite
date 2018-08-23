import React, { Component } from "react";

export default class Logs extends Component {


  render() {
    const { audits } = this.props;

    return (
      <div className="modal-content">
        <h4>Search Audits</h4>
        <ul>
        {
          audits.map(audit => {
            return(
              <ul key={audit.timeStamp}>
              <li className="audits"><strong>{audit.timeStamp}</strong></li>
                <ul>
                  <li>User: {audit.user}</li>
                  <li>Action: {audit.action}</li>
                </ul>
              </ul>
            )

          })
        }
        </ul>
        </div>
    );
  }
}
