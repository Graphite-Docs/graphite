import React from 'reactn';
import { Modal, Button } from 'semantic-ui-react';
const share = require('../../helpers/shareDoc');

export default class SharePublic extends React.Component {

    render() {
        const { singleDoc, userSession } = this.global;
        let docId;
        if(window.location.href.includes("new")) {
            docId = window.location.href.split("new/")[1];
        } else {
            docId = singleDoc.id;
        }
        return (
            <Modal 
                id="share-public-modal"
                closeIcon 
                style={{borderRadius: "0", display: "none"}}
                >
                <Modal.Header style={{fontFamily: "Muli, san-serif", fontWeight: "200"}}>Share Publicly</Modal.Header>
                <Modal.Content>
                    <Modal.Description>
                        <p>This data is not encrypted and can be accessed by anyone with the link that will be generated.</p>
                        {
                        singleDoc.singleDocIsPublic === true ?
                        <div>
                            <p style={{marginBottom: "15px"}}>This document is already being shared publicly.</p>

                            <Button style={{ borderRadius: "0" }} onClick={share.toggleReadOnly} color="green">{singleDoc.readOnly === true ? "Make Editable" : "Make Read-Only"}</Button>
                            <Button style={{ borderRadius: "0" }} onClick={share.stopSharing} color="red">Stop Sharing Publicly</Button>
                            <p style={{marginTop: "15px", marginBottom: "15px"}}>
                            {singleDoc.readOnly === true ? "This shared document is read-only." : "This shared document is editable."}
                            </p>
                            <div>
                            <p><a href={`${window.location.origin}/shared/docs/${userSession.loadUserData().username}-${docId}`}>{`${window.location.origin}/shared/docs/${userSession.loadUserData().username}-${docId}`}</a></p>
                            </div>
                        </div>
                        :
                        <Button style={{ borderRadius: "0" }} secondary onClick={share.sharePublicly}>Share Publicly</Button>
                        }

                    </Modal.Description>
            </Modal.Content>
        </Modal>
        )
    }
}