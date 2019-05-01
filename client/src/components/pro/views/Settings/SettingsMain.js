import React, { Component } from 'reactn';
import Teams from './Teams';
import Users from './Users';
import Organization from './Organization';
import SelectedTeam from './SelectedTeam';
import { List } from 'semantic-ui-react';

class SettingsMain extends Component {
  constructor(props) {
      super(props);
      this.state = {
          settingsNav: "org"
      }
  }
  render() {
      const { settingsNav } = this.state;
      const { selectedTeam } = this.global;
      return (
        <div>
            <div className="settings-side">
                <List>
                    <List.Item>
                        <button onClick={() => this.setState({ settingsNav: "org" })} className="link-button">Organization</button>
                    </List.Item>
                    <List.Item>
                        <button onClick={() => this.setState({ settingsNav: "teams" })} className="link-button">Teams</button>
                    </List.Item>
                    <List.Item>
                        <button onClick={() => this.setState({ settingsNav: "users" })} className="link-button">Users</button>
                    </List.Item>
                </List>
            </div>
            <div className="settings-main-container">
                {
                    selectedTeam !== "" ? 
                    <SelectedTeam /> : 
                    settingsNav === "org" ? <Organization /> : settingsNav === "teams" ? <Teams /> : <Users />
                }
            </div>
        </div>
       );
  }
}

export default SettingsMain;
