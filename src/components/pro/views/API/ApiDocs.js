import React, { Component } from 'reactn';
import SwaggerUI from "swagger-ui-react"
import axios from 'axios';
import "swagger-ui-react/swagger-ui.css"

class APIDocs extends Component {
  render() {
      return (
        <div>
            <SwaggerUI url={`${axios.default.baseURL}/api-spec`} />
        </div>
       );
  }
}

export default APIDocs;
