import React from 'reactn';
import { Link } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';
import { handleTitle } from '../../helpers/singleDoc';
export default class MainMenu extends React.Component {
    render() {
        const { title, autoSave, userSession } = this.global;
        return (
            <div className="top-toolbar">
                {
                    userSession.isUserSignedIn() ?
                    <ul>
                        <li><Link to={'/documents'}><Icon style={{color: "#282828"}} name='arrow left' /></Link></li>
                        <li><strong><input className="title-input" value={title ? title : "Untitled"} onChange={handleTitle} type="text" /></strong></li>
                        <li style={{cursor: "default", position: "absolute", right: "5px", top: "2px"}}><strong>{autoSave}</strong></li>
                    </ul> : 
                    <ul>
                        <li><strong>{title}</strong></li>
                    </ul>
                }
            </div>
        )
    }
}