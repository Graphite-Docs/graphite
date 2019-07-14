import React from 'reactn';


export default class PageSettings extends React.Component {

  handleClose = () => {
    document.getElementById('table-modal').style.display = "none";
    document.getElementById('dimmer').style.display = "none";
  }

  getTableParams = (obj) => {
     document.getElementById('table-size').innerText = obj;
  }


  render() {
    return (
    <div style={{display: "none"}} id="table-drop" className="table-drop">
        <p style={{marginLeft: "10px"}}>Insert Table</p>
        <span id="table-size"></span>
        <div className="columns table-columns">
            <div className="column">
                <div onClick={() => this.props.setTable('1x1')} onMouseOver={() => this.getTableParams('1x1')} id="1x1" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('1x2')} onMouseOver={() => this.getTableParams('1x2')} id="1x2" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('1x3')} onMouseOver={() => this.getTableParams('1x3')} id="1x3" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('1x4')} onMouseOver={() => this.getTableParams('1x4')} id="1x4" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('1x5')} onMouseOver={() => this.getTableParams('1x5')} id="1x5" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('1x6')} onMouseOver={() => this.getTableParams('1x6')} id="1x6" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('1x7')} onMouseOver={() => this.getTableParams('1x7')} id="1x7" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('1x8')} onMouseOver={() => this.getTableParams('1x8')} id="1x8" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('1x9')} onMouseOver={() => this.getTableParams('1x9')} id="1x9" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('1x10')} onMouseOver={() => this.getTableParams('1x10')} id="1x10" className="table-size-box">
                    <span></span>
                </div>
            </div>
            <div className="column">
                <div onClick={() => this.props.setTable('2x1')} onMouseOver={() => this.getTableParams('2x1')} id="2x1" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('2x2')} onMouseOver={() => this.getTableParams('2x2')} id="2x2" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('2x3')} onMouseOver={() => this.getTableParams('2x3')} id="2x3" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('2x4')} onMouseOver={() => this.getTableParams('2x4')} id="2x4" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('2x5')} onMouseOver={() => this.getTableParams('2x5')} id="2x4" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('2x6')} onMouseOver={() => this.getTableParams('2x6')} id="2x5" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('2x7')} onMouseOver={() => this.getTableParams('2x7')} id="2x7" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('2x8')} onMouseOver={() => this.getTableParams('2x8')} id="2x8" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('2x9')} onMouseOver={() => this.getTableParams('2x9')} id="2x9" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('2x10')} onMouseOver={() => this.getTableParams('2x10')} id="2x10" className="table-size-box">
                    <span></span>
                </div>
            </div>
            <div className="column">
            <div onClick={() => this.props.setTable('3x1')} onMouseOver={() => this.getTableParams('3x1')} id="3x1" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('3x2')} onMouseOver={() => this.getTableParams('3x2')} id="3x2" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('3x3')} onMouseOver={() => this.getTableParams('3x3')} id="3x3" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('3x4')} onMouseOver={() => this.getTableParams('3x4')} id="3x4" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('3x5')} onMouseOver={() => this.getTableParams('3x5')} id="3x5" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('3x6')} onMouseOver={() => this.getTableParams('3x6')} id="3x6" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('3x7')} onMouseOver={() => this.getTableParams('3x7')} id="3x7" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('3x8')} onMouseOver={() => this.getTableParams('3x8')} id="3x8" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('3x9')} onMouseOver={() => this.getTableParams('3x9')} id="3x9" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('3x10')} onMouseOver={() => this.getTableParams('3x10')} id="3x10" className="table-size-box">
                    <span></span>
                </div>
            </div>
            <div className="column">
            <div onClick={() => this.props.setTable('4x1')} onMouseOver={() => this.getTableParams('4x1')} id="4x1" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('4x2')} onMouseOver={() => this.getTableParams('4x2')} id="4x2" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('4x3')} onMouseOver={() => this.getTableParams('4x3')} id="4x3" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('4x4')} onMouseOver={() => this.getTableParams('4x4')} id="4x4" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('4x5')} onMouseOver={() => this.getTableParams('4x5')} id="4x5" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('4x6')} onMouseOver={() => this.getTableParams('4x6')} id="4x6" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('4x7')} onMouseOver={() => this.getTableParams('4x7')} id="4x7" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('4x8')} onMouseOver={() => this.getTableParams('4x8')} id="4x8" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('4x9')} onMouseOver={() => this.getTableParams('4x9')} id="4x9" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('4x10')} onMouseOver={() => this.getTableParams('4x10')} id="4x10" className="table-size-box">
                    <span></span>
                </div>
            </div>
            <div className="column">
            <div onClick={() => this.props.setTable('5x1')} onMouseOver={() => this.getTableParams('5x1')} id="5x1" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('5x2')} onMouseOver={() => this.getTableParams('5x2')} id="5x2" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('5x3')} onMouseOver={() => this.getTableParams('5x3')} id="5x3" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('5x4')} onMouseOver={() => this.getTableParams('5x4')} id="5x4" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('5x5')} onMouseOver={() => this.getTableParams('5x5')} id="5x5" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('5x6')} onMouseOver={() => this.getTableParams('5x6')} id="5x6" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('5x7')} onMouseOver={() => this.getTableParams('5x7')} id="5x7" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('5x8')} onMouseOver={() => this.getTableParams('5x8')} id="5x8" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('5x9')} onMouseOver={() => this.getTableParams('5x9')} id="5x9" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('5x10')} onMouseOver={() => this.getTableParams('5x10')} id="5x10" className="table-size-box">
                    <span></span>
                </div>
            </div>
            <div className="column">
            <div onClick={() => this.props.setTable('6x1')} onMouseOver={() => this.getTableParams('6x1')} id="6x1" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('6x2')} onMouseOver={() => this.getTableParams('6x2')} id="6x2" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('6x3')} onMouseOver={() => this.getTableParams('6x3')} id="6x3" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('6x4')} onMouseOver={() => this.getTableParams('6x4')} id="6x4" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('6x5')} onMouseOver={() => this.getTableParams('6x5')} id="6x5" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('6x6')} onMouseOver={() => this.getTableParams('6x6')} id="6x6" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('6x7')} onMouseOver={() => this.getTableParams('6x7')} id="6x7" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('6x8')} onMouseOver={() => this.getTableParams('6x8')} id="6x8" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('6x9')} onMouseOver={() => this.getTableParams('6x9')} id="6x9" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('6x10')} onMouseOver={() => this.getTableParams('6x10')} id="6x10" className="table-size-box">
                    <span></span>
                </div>
            </div>
            <div className="column">
            <div onClick={() => this.props.setTable('7x1')} onMouseOver={() => this.getTableParams('7x1')} id="7x1" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('7x2')} onMouseOver={() => this.getTableParams('7x2')} id="7x2" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('7x3')} onMouseOver={() => this.getTableParams('7x3')} id="7x3" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('7x4')} onMouseOver={() => this.getTableParams('7x4')} id="7x4" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('7x5')} onMouseOver={() => this.getTableParams('7x5')} id="7x5" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('7x6')} onMouseOver={() => this.getTableParams('7x6')} id="7x6" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('7x7')} onMouseOver={() => this.getTableParams('7x7')} id="7x7" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('7x8')} onMouseOver={() => this.getTableParams('7x8')} id="7x8" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('7x9')} onMouseOver={() => this.getTableParams('7x9')} id="7x9" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('7x10')} onMouseOver={() => this.getTableParams('7x10')} id="7x10" className="table-size-box">
                    <span></span>
                </div>
            </div>
            <div className="column">
            <div onClick={() => this.props.setTable('8x1')} onMouseOver={() => this.getTableParams('8x1')} id="8x1" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('8x2')} onMouseOver={() => this.getTableParams('8x2')} id="8x2" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('8x3')} onMouseOver={() => this.getTableParams('8x3')} id="8x3" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('8x4')} onMouseOver={() => this.getTableParams('8x4')} id="8x4" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('8x5')} onMouseOver={() => this.getTableParams('8x5')} id="8x5" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('8x6')} onMouseOver={() => this.getTableParams('8x6')} id="8x6" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('8x7')} onMouseOver={() => this.getTableParams('8x7')} id="8x7" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('8x8')} onMouseOver={() => this.getTableParams('8x8')} id="8x8" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('8x9')} onMouseOver={() => this.getTableParams('8x9')} id="8x9" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('8x10')} onMouseOver={() => this.getTableParams('8x10')} id="8x10" className="table-size-box">
                    <span></span>
                </div>
            </div>
            <div className="column">
            <div onClick={() => this.props.setTable('9x1')} onMouseOver={() => this.getTableParams('9x1')} id="9x1" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('9x2')} onMouseOver={() => this.getTableParams('9x2')} id="9x2" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('9x3')} onMouseOver={() => this.getTableParams('9x3')} id="9x3" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('9x4')} onMouseOver={() => this.getTableParams('9x4')} id="9x4" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('9x5')} onMouseOver={() => this.getTableParams('9x6')} id="9x5" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('9x6')} onMouseOver={() => this.getTableParams('9x6')} id="9x6" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('9x7')} onMouseOver={() => this.getTableParams('9x7')} id="9x7" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('9x8')} onMouseOver={() => this.getTableParams('9x8')} id="9x8" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('9x9')} onMouseOver={() => this.getTableParams('9x9')} id="9x9" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('9x10')} onMouseOver={() => this.getTableParams('9x10')} id="9x10" className="table-size-box">
                    <span></span>
                </div>
            </div>
            <div className="column">
            <div onClick={() => this.props.setTable('10x1')} onMouseOver={() => this.getTableParams('10x1')} id="10x1" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('10x2')} onMouseOver={() => this.getTableParams('10x2')} id="10x2" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('10x3')} onMouseOver={() => this.getTableParams('10x3')} id="10x3" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('10x4')} onMouseOver={() => this.getTableParams('10x4')} id="10x4" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('10x5')} onMouseOver={() => this.getTableParams('10x5')} id="10x5" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('10x6')} onMouseOver={() => this.getTableParams('10x6')} id="10x6" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('10x7')} onMouseOver={() => this.getTableParams('10x7')} id="10x7" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('10x8')} onMouseOver={() => this.getTableParams('10x8')} id="10x8" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('10x9')} onMouseOver={() => this.getTableParams('10x9')} id="10x9" className="table-size-box">
                    <span></span>
                </div>
                <div onClick={() => this.props.setTable('10x10')} onMouseOver={() => this.getTableParams('10x10')} id="10x10" className="table-size-box">
                    <span></span>
                </div>
            </div>
        </div>
    </div>
    );
  }
}
