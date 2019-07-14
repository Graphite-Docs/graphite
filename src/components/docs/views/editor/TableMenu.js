import React from 'reactn';

export default class TableMenu extends React.Component {

    render() {
        const { editor } = this.props;
        return (
            <div className="menu-bar no-print">
            <ul>
                <li onClick={() => editor.insertRow()}>Insert Row</li>
                <li onClick={() => editor.removeRow()}>Remove Row</li>
                <li onClick={() => editor.insertColumn()}>Insert Column</li>
                <li onClick={() => editor.removeColumn()}>Remove Column</li>
                <li onClick={() => editor.removeTable()}>Remove Table</li>
            </ul>
        </div>
        )
    }
}