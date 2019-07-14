import React from 'reactn';

export default class HeaderMenu extends React.Component {

  style = (type) => {
      if(type === 'bold') {
        document.execCommand('bold', false, null)
      } else if(type === "italic") {
        document.execCommand('italic', false, null)
      } else if(type === "underline") {
        document.execCommand('underline', false, null)
      } else if(type === "left") {
        document.execCommand('justifyLeft', false, null)
      } else if(type === "center") {
        document.execCommand('justifyCenter', false, null)
      } else if(type === "right") {
        document.execCommand('justifyRight', false, null)
      }
  }

  render() {
    return (
    <div className="no-print">
        
    </div>
    );
  }
}
