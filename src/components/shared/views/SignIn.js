import React, { Component, setGlobal } from 'reactn';
import { Container, Image, Icon, Card, Modal, Input } from "semantic-ui-react";
import logo from "../../../assets/images/graphite-logo.svg";
import { signIn as signUserIn } from '../helpers/auth';
import { standardSignin, signUp } from '../helpers/auth';
import loginButton from '../../../assets/images/loginButton.png';
import signupButton from '../../../assets/images/signupButton.png';

let buttonStyle = {
  background: "#ffbd27",
  color: "#000",
  borderRadius: "0",
  margin: "5px",
  height: "55px"
};

class SignIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signIn: true
    }
  }
  componentDidMount() {
    let body = document.getElementsByTagName("body");
    body[0].style.background = "#eee";
    setGlobal({ loading: false });
  }
  renderAuthFields() {
    const { signIn } = this.state;
    if(signIn === true) {
      return (
        <div>
          <Input id="signin-username" placeholder='username' />
          <p style={{marginTop: "10px"}}>Username</p>
          <Input id="signin-password" type="password" placeholder='password' />
          <p style={{marginTop: "10px"}}>Password</p>
          <button onClick={standardSignin} className="link-button"><img className="simpleID-button" src={loginButton} alt="login" /></button>
        </div>
      )
    } else {
      return (
        <div>
          <Input id="sign-up-username" placeholder='username' />
          <p style={{marginTop: "10px"}}>Username</p>
          <p id="auth-error" style={{color: "red"}}></p>
          <Input id="sign-up-email" placeholder='email' />
          <p style={{marginTop: "10px"}}>Email</p>
          <Input id="sign-up-password" type="password" placeholder='password' />
          <p style={{marginTop: "10px"}}>Password</p>
          <p style={{maxWidth: "40%", margin: "auto"}} className="note">Note: If you lose your password, your account cannot be recovered, so save it somewhere secure and accessible.</p>
          <br/><button onClick={signUp} className="link-button"><img className="simpleID-button" src={signupButton} alt="sign up" /></button>
        </div>
      )
    }
  }
  renderContent() {
    const { signIn } = this.state;
    const { loading } = this.global;
    if(loading !== true) {
      return (
        <Card.Content>
          <Card.Description>     
            <div className='margin-top-35'>
            <ul style={{marginBottom: "20px"}} className="signin_up">
              <li style={signIn ? {textDecoration: "underline", cursor: "pointer", fontSize: "16px"} : {cursor: "pointer", fontSize: "16px"}} onClick={() => this.setState({ signIn: true })}>Sign In</li>
              <li style={signIn !== true ? {textDecoration: "underline", cursor: "pointer", fontSize: "16px"} : {cursor: "pointer", fontSize: "16px"}} onClick={() => this.setState({ signIn: false })}>Sign Up</li>
            </ul>
            {this.renderAuthFields()}
            <div className='margin-top-45'>
              <p>If you created your account through the "Blockstack Browser", you can log in through <button onClick={signUserIn} style={{color: "#ffbd27"}} className="link-button">Blockstack's interface</button></p>
              
            </div>
          </div>
          </Card.Description>
        </Card.Content>
      )
    } else {
      return (
        <Card.Content>
          <Card.Description>     
            <div className='margin-top-35'>
             <h3>Just a moment...</h3>
            </div>
          </Card.Description>
        </Card.Content>
      )
    }
  }
  render() {
      return (
        <div className="hero-main">
          <div id="wave">
          <Container className='center'>
            <Image src={logo} style={{ maxWidth: "65%", margin: "auto" }} />
            <Card
              style={{
                width: "65%",
                minHeight: "300px",
                margin: "auto",
                marginTop: "35px"
              }}
            >
              {this.renderContent()}
              <Card.Content extra>
                <Modal
                  closeIcon
                  trigger={
                    <button className='link-button'>
                      <Icon name="info" />
                      Learn More
                    </button>
                  }
                >
                  <Modal.Content>
                    <Modal.Description>
                      <h3>What is this all about?</h3>
                      <p>
                        Graphite allows users to create accounts and sign in with simple username and password authentication all while still providing users a decentralized identity anchored to the bitcoin blockchain.
                      </p>
                      <p>
                       When signing in, whether it be via the advanced option of going through the Blockstack Browser or using the username/password option, passwords and private keys are never exposed to Graphite. If you use the username and password option, you are making a request to SimpleID, a protocol that sits above the Blockstack layer. Your password is never stored and therefore not accessible should there ever be a data breach.
                      </p>
                      <p>This also means your password is incredibly important. If you lose it, you will not be able to access your account. We recommend you use a password manager to store this.</p>
                    </Modal.Description>
                  </Modal.Content>
                </Modal>
              </Card.Content>
            </Card>

            <h4 style={{ marginTop: "55px" }}>
              <a
                style={{color: "#ffbd27"}}
                href="https://graphitedocs.com/about"
                target="_blank"
                rel="noopener noreferrer"
              >
                About Graphite
              </a>
            </h4>
          </Container>
          </div>
        </div>
       );
  }
}

export default SignIn;
