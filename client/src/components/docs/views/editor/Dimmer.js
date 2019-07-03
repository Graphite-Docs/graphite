import React from 'reactn';


export default class Dimmer extends React.Component {
  handleDimmerClick = () => {
      let modals = document.getElementsByClassName('modal');
      for (const modal of modals) {
          modal.style.display = "none";
      }
      document.getElementById('dimmer').style.display = "none";
  }
  render() {

    return (
    <div onClick={this.handleDimmerClick} style={{display: "none"}} id="dimmer" className="dimmer">
        
    </div>
    );
  }
}
