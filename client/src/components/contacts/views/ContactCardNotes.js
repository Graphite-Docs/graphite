import React, { Component } from 'reactn';
import { Container, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class ContactCardNotes extends Component {
  render() {
      const { graphitePro } = this.global;
      return (
        <div>
            {graphitePro ? 
                <p>Notes</p> : 
                <Container style={{padding: "15px"}}>
                    <h3>Ready to get more?</h3>
                    <div>
                        <div>
                            <p>With Graphite Pro, you can add notes and track your communication with any given contact. <Link to={'/trial'}>Try it free for 30 days.</Link></p>
                            <Link to={'/trial'}><Button secondary>Try Graphite Pro Free</Button></Link>
                        </div>
                    </div>
                </Container>
            }
        </div>
       );
  }
}

export default ContactCardNotes;
