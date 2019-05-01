import React, { Component, setGlobal } from 'reactn';
import Nav from '../../shared/views/Nav';
import { Container, Button, Modal, Form, Divider, Grid, Image, Card} from 'semantic-ui-react';
import files from '../../../assets/images/files_and_folder.svg';
import security from '../../../assets/images/security.svg';
import teamWork from '../../../assets/images/group_presentation.svg';
import dataCenter from '../../../assets/images/data_center.svg';
import { startTrial } from '../helpers/trialSignUps';

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
      const { trialModalOpen } = this.global;
      const { trialStarting } = this.state;
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
                                    <Card className="pricing-card center">
                                        <div>
                                            <Container>
                                                <h3>Pro Plan</h3>
                                                <h2 style={{color: "#2185d0"}}>$99/month - up to 5 users</h2>
                                                <ul className="feature-list">
                                                    <li>$1 per user per month after 5</li>
                                                    <li>Email support</li>
                                                    <li>Your data hosted on your server</li>
                                                    <li>Audit logs</li>
                                                    <li>Team management and collaboration</li>
                                                    <li>Roles and permissions</li>
                                                </ul>
                                            </Container>
                                        </div>
                                    </Card>
                                </Grid.Row>
                            </Grid.Column>
                            <Grid.Column>
                                <Grid.Row>
                                    <Card className="pricing-card">
                                        <div>
                                            <Container>
                                                <h3>Custom Enterprise Plan</h3>
                                                <h2 style={{color: "#2185d0"}}>Pricing varies based on needs</h2>
                                                <ul className="feature-list">
                                                    <li>All of the Pro Plan feature plus</li>
                                                    <li>Phone support</li>
                                                    <li>Storage hub customization</li>
                                                    <li>Custom deployment of your storage hub server</li>
                                                    <li>Key management service</li>
                                                    <li>Additional customizations per your request</li>
                                                </ul>
                                            </Container>
                                        </div>
                                    </Card>
                                </Grid.Row>
                            </Grid.Column>
                        </Grid>
                        
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

export default Trial;
