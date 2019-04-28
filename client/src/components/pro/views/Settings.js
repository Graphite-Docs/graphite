import React, { Component } from 'reactn';
import Trial from './Trial';
import SettingsSkeleton from './SettingsSkeleton';
import SettingsMain from './SettingsMain';
import Nav from '../../shared/views/Nav';

class Settings extends Component {
  render() {
      const { graphitePro, proLoading } = this.global;
      if(proLoading) {
        return (
          <SettingsSkeleton/>
        )
      } else {
        if(graphitePro) {
          return (
            <div>
              <Nav />
              <SettingsMain/>
            </div>
          )
        }
        return (
          <Trial/>
        );
    }
      }
}

export default Settings;
