import React, { Component } from 'reactn';
import Welcome from './Welcome';
import Trial from './Trial';

class Walkthrough extends Component {

  render() {
      const { graphitePro } = this.global;
      if(graphitePro) {
        return (
            <div>
             <Welcome />
            </div>
           );
      } else {
          return (
              <Trial />
          )
      }
  }
}

export default Walkthrough;
