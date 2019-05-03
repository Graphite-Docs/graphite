import React, { Component, setGlobal } from 'reactn';
import Teams from './Teams';
import Users from './Users';
import Organization from './Organization';
import SelectedTeam from './SelectedTeam';
import { List } from 'semantic-ui-react';

class SettingsMain extends Component {
  render() {
      const { selectedTeam, settingsNav, proOrgInfo, userSession } = this.global;
      const thisUser = proOrgInfo.users.filter(users => users.username === userSession.loadUserData().username)[0];
      return (
        <div>
            <div className="settings-side">
                <List>
                    <List.Item>
                        <button onClick={() => setGlobal({ settingsNav: "org", selectedTeam: "" })} className="link-button">Organization</button>
                    </List.Item>
                    <List.Item>
                        <button onClick={() => setGlobal({ settingsNav: "teams", selectedTeam: "" })} className="link-button">Teams</button>
                    </List.Item>
                    <List.Item>
                        {thisUser.isAdmin ? <button onClick={() => setGlobal({ settingsNav: "users", selectedTeam: "" })} className="link-button">Users</button> : <button className="hide"></button>}
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
