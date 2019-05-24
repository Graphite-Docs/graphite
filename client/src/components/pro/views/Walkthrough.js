import React, { Component } from 'reactn';
import Welcome from './Welcome';
import Trial from './Trial';
import SettingsSkeleton from './SettingsSkeleton';

class Walkthrough extends Component {

  render() {
      const { graphitePro, loading } = this.global;
      if(loading) {
          return (
              <SettingsSkeleton />
          )
      } else {
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
}

export default Walkthrough;
