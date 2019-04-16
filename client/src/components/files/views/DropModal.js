import React, { Component } from 'reactn';
import { Modal, Icon, Image, Container } from 'semantic-ui-react';
import Dropzone from 'react-dropzone';
import { handleVaultDrop } from '../helpers/newVaultFile';
import enhance from '../../../assets/images/enhance.gif';

class EmptyComponent extends Component {
  render() {
    const { fileProcessing } = this.global;
    const dropzoneStyle = {
        width  : "100%",
        height : "400px",
  
        marginTop: "74px",
        background: "#282828",
        paddingTop: "10%",
        cursor: "pointer"
      };
      return (
        <div>
            <h3 className="center" style={{paddingTop: "15px", marginBottom: "-45px"}}>{fileProcessing ? "Uploading File..." : "Upload a File"}</h3>
            <Modal.Content>
                <Modal.Description>
                {fileProcessing ? 
                    <Container className="file-processing">
                        <Image src={enhance} />
                        <p>Your file is being enhanced and optimized...</p>
                        <p>...just kidding! It's just being uploaded to your storage hub. Sit tight.</p>
                    </Container> : 

                    <Dropzone
                        style={dropzoneStyle}
                        onDrop={ handleVaultDrop }
                        accept="text/html, application/rtf, application/x-rtf, text/richtext, text/plain, application/rtf, application/x-rtf, text/rtf, application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv, video/quicktime, video/x-ms-wmv,video/mp4,application/pdf,image/png,image/jpeg,image/jpg,image/tiff,image/gif"
                        multiple={ false }
                        onDropRejected={ this.handleReject }>
                        <div style={{marginTop: "45px"}}>
                        <h1 style={{textAlign: "center", color: "#fff"}} className="upload-cloud"><Icon style={{fontSize: "40px"}} name="cloud upload" /></h1>
                        <h3 style={{textAlign: "center", color: "#fff", fontSize: "40px"}} className="white-text">Drag files or click to upload</h3>
                        </div>
                    </Dropzone>
                }
                </Modal.Description>
            </Modal.Content>
        </div>
       );
  }
}

export default EmptyComponent;
