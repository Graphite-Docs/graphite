import React from 'reactn';
import { Modal, Item, Accordion, Button, Icon } from 'semantic-ui-react';
const single = require('../../helpers/singleDoc');

export default class TeamShare extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeIndex: 0
        }
    }
    render() {
        const { proOrgInfo, teamShare } = this.global;
        const { activeIndex }= this.state;
        const teamList = proOrgInfo ? proOrgInfo.teams ? proOrgInfo.teams : [] : [];
        return (
            <Modal 
                id="share-team-modal"
                closeIcon 
                style={{borderRadius: "0", display: "none"}}
                >
                <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Share With Team</Modal.Header>
                <Modal.Content>
                <Modal.Description>
                    <p>By sharing with your entire team, each teammate will have immediate access to the document and will be able to collaborate in real-time.</p>
                    <p>For reference, you can see your list of teammates by expanding each team below.</p>
                    <Item.Group divided>
                    {teamList.map(team => {
                        return (
                            <Item className="contact-search" key={team.id}>
                            <Item.Content verticalAlign='middle'>
                            <Accordion>
                            <Accordion.Title active={activeIndex === team.id} index={team.id} onClick={this.handleClick}>
                                <Icon name='dropdown' />
                                {`${team.name} (${team.users.length} members)`}
                            </Accordion.Title>
                            <Accordion.Content active={activeIndex === team.id}>
                                {
                                team.users.map(user => {
                                    return (
                                    <p key={user.username}>
                                        {user.username}
                                    </p>
                                    )
                                })
                                }
                            </Accordion.Content>
                            </Accordion>
                            <br/>
                            {
                            teamShare === false ? 
                            <Button style={{float: "right", borderRadius: "0px"}} secondary onClick={() => single.shareWithTeam({teamId: team.id, teamName: team.name, initialShare: true})}>Share</Button> : 
                            <div className="hide" />
                            }
                            </Item.Content>
                            </Item>
                            )
                        }
                        )
                    }
                    </Item.Group>
                    {teamShare === false ? <div className="hide" /> : <Button style={{borderRadius: "0"}}>Sharing...</Button>}
                </Modal.Description>
                </Modal.Content>
        </Modal>
        )
    }
}