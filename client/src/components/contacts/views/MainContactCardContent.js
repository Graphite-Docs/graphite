import React, { Component } from 'reactn';
import { Segment } from 'semantic-ui-react';
import ContactCardFree from './ContactCardFree';
import ContactCardPro from './ContactCardPro';

class MainContactCardContent extends Component {
  render() {
      const { name, contact } = this.props;
      const { graphitePro } = this.global;
      return (
        <Segment>
        {graphitePro ? 
            <ContactCardPro 
            name={name}
            contact={contact}
            /> : 
            <ContactCardFree 
            name={name}
            contact={contact}
        />
        }
        </Segment>
       );
  }
}

export default MainContactCardContent;