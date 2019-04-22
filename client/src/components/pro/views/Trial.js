import React, { Component, setGlobal } from 'reactn';
import Nav from '../../shared/views/Nav';
import { Container, Button, Modal, Form, Divider, Grid, Image} from 'semantic-ui-react';
import files from '../../../assets/images/files_and_folder.svg';
import security from '../../../assets/images/security.svg';
import teamWork from '../../../assets/images/group_presentation.svg';
import dataCenter from '../../../assets/images/data_center.svg';
import { getNotified } from '../helpers/trailSignUps';

class Trial extends Component {
  render() {
      const { getNotifiedModalOpen } = this.global;
      return (
        <div>
         <Nav />
         <div className="margin-top-65" style={{marginBottom: "85px"}}>
             <Container>
                 <div className="center">
                    <h1>Try Graphite Pro. Your organization deserves it, right?</h1>
                    <h2>Total security for your entire team starts with identity and encryption.</h2>
                    <p>Graphite Pro is nearing completion. Sign up to be notified for early access.</p>
                    <div className="margin-top-25">
                        <Modal 
                        trigger={<Button onClick={() => setGlobal({ getNotifiedModalOpen: true })} size='massive' color="blue">Get notified</Button>}
                        open={getNotifiedModalOpen}
                        onClose={() => setGlobal({ getNotifiedModalOpen: false })}
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
                                <Button onClick={getNotified} secondary>Submit</Button>
                            </Form>
                            </Modal.Description>
                            </Modal.Content>
                        </Modal>
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
                    <div>
                        <h1>Affordable pricing whether you're small or massive.</h1>
                        <h2>Sign up to be notified of Graphite Pro's release and learn about pricing and options.</h2>
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
