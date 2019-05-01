import React, { Component } from 'reactn';
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

class APIDocs extends Component {
  render() {
      return (
        <div>
            <SwaggerUI url="http://localhost:5000/api-spec" />
        </div>
       );
  }
}

export default APIDocs;
