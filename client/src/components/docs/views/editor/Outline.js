import React, { setGlobal } from 'reactn';
import { Icon } from 'semantic-ui-react';
export default class Outline extends React.Component {
  handleScroll = (id) => {
    document.getElementById(id).scrollIntoView();
  }

  handleCloseOutline = () => {
      document.getElementById('doc-outline').style.display = "none";
      setGlobal({ docOutline: [] })
  }
  render() {
    const { docOutline } = this.global;
    return (
    <div style={{display: "none"}} id='doc-outline' className="no-print">
        <div id="doc-outline-inner" className="table-of-contents">
            <p style={{position: "absolute", top: "0", right: "10px", cursor: "pointer"}} onClick={this.handleCloseOutline}><Icon name="close" /></p>
            <h3 style={{fontWeight: "200", marginLeft: "20px"}}>Document Outline</h3>
            <div className="divider" />
            <ul>
                {
                    docOutline.map(item => {
                        return (
                            <li onClick={() => this.handleScroll(item.id)} key={item.id}>{item.text}</li>
                        )
                    })
                }
            </ul>
        </div>
    </div>
    );
  }
}
