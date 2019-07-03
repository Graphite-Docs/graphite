export function onClickList(event, editor, type) {
    event.preventDefault();
    console.log(type);
    if(type === 'ordered-list') {
        console.log("ordered")
        editor.setBlocks('list-item').wrapBlock('ordered-list').focus()
    } else if(type === "unordered-list") {
        editor.setBlocks('list-item').wrapBlock('unordered-list').focus()
    }
}