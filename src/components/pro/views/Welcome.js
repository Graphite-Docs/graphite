import React, { Component, setGlobal } from 'reactn';
import { Grid, Icon, Container, Button, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import Nav from '../../shared/views/Nav';
import welcomesteps from './welcomeSteps.json';
import { handleProCheck } from '../helpers/account';

class Welcome extends Component {
  constructor(props) {
      super(props);
      this.state = {
          welcomeStep: 1
      }
  }

  handlePageChange = (direction) => {
      const { welcomeStep } = this.state;
      if(direction === 'back') {
        if(welcomeStep !== 1) {
            this.setState({ welcomeStep: this.state.welcomeStep - 1});
        }
      } else {
        if(welcomeStep !== welcomesteps.steps.length) {
            this.setState({ welcomeStep: this.state.welcomeStep + 1});
        }
      }
      
  }

  handleDone = async () => {
    const pro = await handleProCheck();
    if(pro === "success") {
        setGlobal({welcome: false})
    } else {
        console.log("Error")
    }
  }
  
  render() {
      const { welcomeStep } = this.state;
      return (
        <div>
            <Nav />
            <Container>
                <div className="center margin-top-45">
                    <h2>Welcome to Graphite Pro!</h2>
                    <p className="margin-top-25">Let's take a quick look at what you just unlocked. Use the left and right arrows to cycle through the walkthrough. Hit the button at the bottom of the screen to finish.</p>
                </div>
            </Container>
            <Grid className="welcome-walk" columns={3}>
            <Grid.Column className="center">
                <Grid.Row>
                    {
                        welcomeStep !== 1 ?
                        <Icon style={{cursor: "pointer"}} onClick={() => this.handlePageChange('back')} name="angle left" size="huge" /> : 
                        <div className="hide" />
                    }
                </Grid.Row>
            </Grid.Column>
            <Grid.Column className="center">
                <Grid.Row>
                <Image src={welcomesteps.steps.filter(a => a.id === welcomeStep)[0].img} alt={welcomesteps.steps.filter(a => a.id === welcomeStep)[0].id} />
                <p className="center margin-top-10">{welcomesteps.steps.filter(a => a.id === welcomeStep)[0].text}</p>
                </Grid.Row>
            </Grid.Column>
            <Grid.Column className="center">
                <Grid.Row>
                    {
                        welcomeStep !== welcomesteps.steps.length ? 
                        <Icon style={{cursor: "pointer"}} onClick={() => this.handlePageChange('forward')} name="angle right" size="huge" /> : 
                        <div className="hide" />
                    }
                
                </Grid.Row>
            </Grid.Column>
            </Grid>
            <Container>
                <div className="center margin-top-100">
                    {
                        window.location.href.includes('settings') ?
                        <Button style={{marginBottom: "45px"}} onClick={this.handleDone} secondary>All Done!</Button> : 
                        <Link onClick={() => setGlobal({ welcome: false })} to={'/settings'}><Button style={{marginBottom: "45px"}} secondary>All Done!</Button></Link>
                    }
                    
                </div>
            </Container>
        </div>
       );
  }
}

export default Welcome;
