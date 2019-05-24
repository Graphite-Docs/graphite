import React, { Component, setGlobal } from 'reactn';
import Nav from '../../shared/views/Nav';
import { Container, Button, Modal, Form, Divider, Grid, Image} from 'semantic-ui-react';
import files from '../../../assets/images/files_and_folder.svg';
import security from '../../../assets/images/security.svg';
import teamWork from '../../../assets/images/group_presentation.svg';
import dataCenter from '../../../assets/images/data_center.svg';
import { startTrial } from '../helpers/trialSignUps';
import Settings from './Settings/Settings';
import Welcome from './Welcome';

class Trial extends Component {
    constructor(props) {
        super(props);
        this.state = {
            trialStarting: false
        }
    }

  start = () => {
    startTrial();
    this.setState({ trialStarting: true })
  }
  render() {
      const { trialModalOpen, welcome, graphitePro } = this.global;
      const { trialStarting } = this.state;
      if(welcome && graphitePro) {
        return (
            <Welcome />
          )
      } else if(graphitePro) {
        return (
            <Settings />
        )  
      } else {
        return (
            <div>
             <Nav />
             <div className="margin-top-65" style={{marginBottom: "85px"}}>
                 <Container>
                     <div className="center">
                        <h1>Try Graphite Pro. Your organization deserves it, right?</h1>
                        <h2>Total security for your entire team starts with identity and encryption.</h2>
                        <p>Start a 30-day free trial today. We won't ask for payment information until the trial period has ended.</p>
                        <div className="margin-top-25">
                            <Modal 
                            trigger={<Button onClick={() => setGlobal({ trialModalOpen: true })} size='massive' color="blue">Start Your Trial</Button>}
                            open={trialModalOpen}
                            onClose={() => setGlobal({ trialModalOpen: false })}
                            >
                                <Modal.Header>Be the first to try Graphite Pro</Modal.Header>
                                <Modal.Content>
                                <Modal.Description>
                                <Form>
                                    <Form.Field>
                                    <label>Name</label>
                                    <input id="trial-name" placeholder='Name' />
                                    </Form.Field>
                                    <Form.Field>
                                    <label>Organization Name</label>
                                    <input id="trial-org" placeholder='Organization Name' />
                                    </Form.Field>
                                    <Form.Field>
                                    <label>Email Address</label>
                                    <input id="trial-email" placeholder='Email' />
                                    </Form.Field>
                                    {
                                        trialStarting ? 
                                        <Button>Starting your trial...</Button> : 
                                        <Button onClick={this.start} secondary>Start my trial account</Button>
                                    }
                                </Form>
                                </Modal.Description>
                                </Modal.Content>
                            </Modal>
                            <p className="margin-top-25"><a href="#pricing">See pricing</a></p>
                        </div>
                        <Divider style={{marginTop: "45px"}} />
                        <div className="margin-top-45">
                            <Grid stackable columns={3}>
                                <Grid.Row>
                                    <Grid.Column>
                                        <h3>Team Collaboration</h3>
                                        <Image className="trial-image" src={teamWork} />
                                        <p className="margin-top-20">Share to your entire team or just an individual person. With team encryption and rotating encryption keys, you can work together without worrying about security.</p>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <h3>Secure Access Control</h3>
                                        <Image className="trial-image" src={security} />
                                        <p className="margin-top-20">Not everyone should have access to everything. Manage your teams, create sub-teams, segment data, and keep permissions in check.</p>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <h3>Business Tools</h3>
                                        <Image className="trial-image" src={files} />
                                        <p className="margin-top-20">Manage your contacts, collect data via encrypted, public forms, audit your team's activity, and more. Graphite Pro offers all the tools you expect of business productivity software.</p>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </div>
                        <Divider style={{marginTop: "45px"}} />
                        <div id="pricing">
                            <h1>Affordable pricing whether you're small or massive.</h1>
                            
                            <Grid columns={2} stackable>
                                <Grid.Column>
                                    <Grid.Row>
                                        <div className="pricing-card center">
                                            <div>
                                                
                                                    <h3>Pro Plan</h3>
                                                    <h2 style={{color: "#2185d0"}}>$99USD/month - up to 15 users</h2>
                                                    <ul className="feature-list">
                                                        <li>Up to 15 users*</li>
                                                        <li>Team management</li>
                                                        <li>Roles and permissions</li>
                                                        <li>Access controls</li>
                                                        <li>Audits (soon)</li>
                                                        <li>Desktop apps (soon)</li>
                                                        <li>Unique encryption keys per team</li>
                                                        <li>Option of partner hosting or self hosting of data**</li>
                                                        <li>SLA (Service Level Agreement):</li>
                                                        <ul>
                                                            <li>Designate one contact in your organization that can reach out for support</li>
                                                            <li>Email support Monday through Friday 8am - 5pm Central Time</li>
                                                            <li>Response time within 3 hours</li>
                                                        </ul>
                                                    </ul>
                                               
                                            </div>
                                        </div>
                                    </Grid.Row>
                                </Grid.Column>
                                <Grid.Column>
                                    <Grid.Row>
                                        <div className="pricing-card">
                                            <div>
                                                
                                                    <h3>Advanced Plan</h3>
                                                    <h2 style={{color: "#2185d0"}}>Starts at $199USD/month</h2>
                                                    <ul className="feature-list">
                                                        <li>All of the Pro Plan feature plus</li>
                                                        <li>Live on-boarding support</li>
                                                        <li>Storage hub customization (custom contract)</li>
                                                        <li>Custom deployment of your storage hub server (custom contract)</li>
                                                        <li>Key management service (custom contract)</li>
                                                        <li>SLA (Service Level Agreement):</li>
                                                        <ul>
                                                            <li>Designate five contacts in your organization that can reach out for support</li>
                                                            <li>Phone support Monday through Friday 9am - 5pm Central Time</li>
                                                            <li>Email support Monday through Friday 8am - 5pm Central Time</li>
                                                            <li>Response time within 1 hours</li>
                                                        </ul>
                                                    </ul>
                                                
                                            </div>
                                        </div>
                                    </Grid.Row>
                                </Grid.Column>
                            </Grid>
                            <span>* Users are classified as people in your organization with an Admin or Manager role. User role users are not counted.</span> <br/>
                            <span>** Partner hosting means storing your data on a storage hub that's already been deployed for you. This option can reduce storage costs but comes with privacy and ownership trade-offs. If you self-host a storage hub, you must deploy it yourself or pay for a custom agreement to have Graphite deploy it.</span>
                            <Image src={dataCenter} className="trial-image" />
                            <h3>It's your organization's data. It should live where you want it to live, and it should be encrypted with keys owned by you.</h3>
                        </div>
                    </div>
                 </Container>
             </div>
            </div>
           );
      }
  }
}

export default Trial;
