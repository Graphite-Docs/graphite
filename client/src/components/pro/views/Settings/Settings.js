import React, { Component } from 'reactn';
import Trial from '../Trial';
import SettingsSkeleton from '../SettingsSkeleton';
import SettingsMain from './SettingsMain';
import Welcome from '../Welcome';
import Nav from '../../../shared/views/Nav';

class Settings extends Component {
  render() {
      const { graphitePro, proLoading, welcome } = this.global;
      if(proLoading) {
        return (
          <SettingsSkeleton/>
        )
      } else if(welcome === true) {
        return (
          <Welcome />
        )
      } else if(welcome === false && graphitePro) {
          return (
            <div>
              <Nav />
              <SettingsMain/>
            </div>
          )
        } else {
          return (
            <Trial/>
          );
        }
    }
}

export default Settings;
