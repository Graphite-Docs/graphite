import React, { Component } from 'reactn';
import { Container, Card, Form, Button } from 'semantic-ui-react';

class PublicFormSkel extends Component {
  render() {
      return (
<div>
                    <Container>
                        <div className="center margin-top-25">
                            <span className="h1-skel"></span>
                            <p style={{color: "red", float: "right"}}>* Required</p>
                        </div>
                        <Card className="public-form-card">
                            <Form>
                              <Form.Field>
                                  <Card className="margin-top-10 form-card">
                                      <span className="h1-skel"><span style={{color: "red", fontSize: "12px", marginLeft: "5px"}}>*</span></span> 
                                      <input type="text" />                                        
                                  </Card>
                              </Form.Field>
                              <Form.Field>
                                  <Card className="margin-top-10 form-card">
                                      <span className="h1-skel"><span style={{color: "red", fontSize: "12px", marginLeft: "5px"}}>*</span></span> 
                                      <input type="text" />                                        
                                  </Card>
                              </Form.Field>
                              <Form.Field>
                                  <Card className="margin-top-10 form-card">
                                      <span className="h1-skel"><span style={{color: "red", fontSize: "12px", marginLeft: "5px"}}>*</span></span> 
                                      <input type="text" />                                        
                                  </Card>
                              </Form.Field>
                                      
                              <Button type='submit'>Submit</Button>
                            </Form>
                        </Card>
                    </Container>
                </div>
       );
  }
}

export default PublicFormSkel;
