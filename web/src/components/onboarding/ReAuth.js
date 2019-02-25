import React, { Component } from "reactn";
import { Button, Modal, Image, Card } from "semantic-ui-react";
import Loading from '../shared/Loading';
import { handleStorage } from "./storage/connectStorage";

export default class ReAuth extends Component {

  componentDidMount() {
    if(window.location.href.includes('code')) {
      this.setGlobal({ loading: true });
      handleStorage();
    }
  }

  render() {
    const { loading } = this.global;
   if(loading) {
     return (
     <Loading />
    )
   } else {
    return(
      <div style={{height: "100%", width: "100%", padding: "25%", background: "#282828"}}>
          <Modal
         trigger={<Button style={{display: "none"}} onClick={this.handleOpen}>Show Modal</Button>}
         open={true}
         closeOnEscape={false}
         closeOnDimmerClick={false}
       >
         <Modal.Content style={{ maxWidth: "70%", margin: "auto" }}>
           <h3>Uh oh, {this.global.provider.charAt(0).toUpperCase() + this.global.provider.slice(1)} needs you to re-authenticate your account.</h3>
           <p style={{ marginBottom: "25px" }}>
             Don't worry, though. All your data is stored and you can pick back up where you left off after you re-authenticate.
           </p>
               <Card key='box'>
                 <Button
                   href="https://account.box.com/api/oauth2/authorize?response_type=code&client_id=08qnqggfcjhyka8oy5io4p3jb891ag17&redirect_uri=http%3A%2F%2Flocalhost%3A3000&state=box-1"
                   labelPosition="left"
                   style={{ margin: "10px" }}
                 >
                   <Image
                     style={{
                       height: "20px",
                       marginTop: "-3px",
                       marginRight: "10px"
                     }}
                     src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Box%2C_Inc._logo.svg/1200px-Box%2C_Inc._logo.svg.png"
                   />
                   Connect Box
                 </Button>
                 <br />
               </Card>
         </Modal.Content>
       </Modal>
      </div>
  )
   }
  }
}
