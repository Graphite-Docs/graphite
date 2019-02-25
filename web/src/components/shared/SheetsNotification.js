import React, { Component } from 'reactn';

export default class SheetsNotification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true
        }
    }

    close = () => {
        this.setState({ show: false });
        localStorage.setItem('sheetsNotificationSeen', JSON.stringify(true))
    }

    renderNotification() {
        if(this.state.show) {
            return (
                <div style={{padding: "20px", textAlign: "center", background: "#ffd762"}}>
                    <p>Graphite Sheets is no longer a supported part of Graphite. You can access you old Sheets files and download them as CSVs <a href="/sheets">here</a>. Read more about <a href="https://medium.com/the-lead/the-end-of-graphite-sheets-c67ce7524364" target="_blank" rel="noopener noreferrer">the end of Graphite Sheets</a>.</p>
                    <p style={{float: "right", marginRight: "5px", marginBottom: "5px"}}><a style={{cursor: "pointer"}} onClick={this.close}>Don't show this anymore</a></p>
                </div>
            );
        } else {
            return(
                <div className='hide' />
            )
        }
    }

    render() {
        return(
            <div>
            {this.renderNotification()}
            </div>
        )
    }
}
