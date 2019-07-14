import React from 'reactn';
import { Button, Input, Container } from 'semantic-ui-react';
import { ToastsStore} from 'react-toasts';
export default class DevTools extends React.Component {
    handleDelete = async (e) => {
        const { userSession } = this.global;
        e.preventDefault()
        const fileName = document.getElementById('file-name-input').value;
        try {
            await userSession.deleteFile(fileName);
            document.getElementById('file-name-input').value = "";
            ToastsStore.success("File deleted");
        } catch(err) {
            console.log(err);
            ToastsStore.error("Error deleting file");
        }
    }
    render() {
        return (
            <Container className="margin-top-65">
                <h3>Warning: This page is meant for developers and advanced users only</h3>
                <p>If you know the full name of a file that you'd like to delete, you can enter it below and delete the file. This is different that the current way deletion is implemented
                     in Graphite. Currently, an empty file is written to represent deletion.
                </p>
                <p>If you choose to use this tool, you acknowledge that Graphite holds no responsibility for any adverse side effects that may arise. Use caution.</p>
                <div>
                    <form onSubmit={this.handleDelete}>
                        <Input type="text" placeholder="account.json" id="file-name-input" /><br/>
                        <label>File name</label><br/>
                        <Button className="margin-top-25" primary type="submit">Delete File</Button>
                    </form>
                </div>
            </Container>
        )
    }
}