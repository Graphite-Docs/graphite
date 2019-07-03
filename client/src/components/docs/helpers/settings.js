import { getGlobal, setGlobal } from 'reactn';

export async function savePageSettings() {
    const thisDoc = {
        marginTop: getGlobal().marginTop,
        marginRight: getGlobal().marginRight,
        marginBottom: getGlobal().marginBottom,
        marginLeft: getGlobal().marginLeft,
        orientation: getGlobal().orientation
    }
    setGlobal({ document: thisDoc });
    document.getElementById('page-settings').style.display = "none";
    document.getElementById('dimmer').style.display = "none";
    let editor = document.getElementById('editor-section');
    editor.style.paddingRight = `${(thisDoc.marginRight * 60 * 1.65)}px`;
    editor.style.paddingLeft = `${(thisDoc.marginLeft * 60 * 1.65)}px`;
    editor.style.paddingTop = `${(thisDoc.marginTop * 60 * 1.65)}px`;
    editor.style.paddingBottom = `${(thisDoc.marginBottom * 60 * 1.65)}px`;
    let pages = document.getElementsByClassName('page-view');
    for(const page of pages) {
        if(thisDoc.orientation === 'landscape') {
            page.style.maxWidth = "1089px";
            page.style.height = "841.5px";
        } else {
            page.style.maxWidth = "841.5px";
            page.style.height = "1089px";
        }
    }
}

export async function handlePageSettings() {
    document.getElementById('file-drop') ? document.getElementById('file-drop').style.display = "none" : document.getElementById('format-drop') ? document.getElementById('format-drop').style.display = "none" : console.log(null);
    document.getElementById('page-settings').style.display = "block";
    document.getElementById('dimmer').style.display = "block";
}

export function lineHeight(spacing) {
    console.log(spacing);
    let writingSpace = document.getElementById('editor-section');
    let doc = getGlobal().document;
    
    if(spacing === 'single') {
            if(writingSpace.classList.contains('single-space')) {
                writingSpace.classList.remove('single-space')
            }
            if(writingSpace.classList.contains('one-point-five-space')) {
                writingSpace.classList.remove('one-point-five-space')
            }
            if(writingSpace.classList.contains('double-space')) {
                writingSpace.classList.remove('double-space')
            }
            writingSpace.classList.add('single-space');
    } else if(spacing === "1.50") {
        if(writingSpace.classList.contains('single-space')) {
            writingSpace.classList.remove('single-space')
        }
        if(writingSpace.classList.contains('one-point-five-space')) {
            writingSpace.classList.remove('one-point-five-space')
        }
        if(writingSpace.classList.contains('double-space')) {
            writingSpace.classList.remove('double-space')
        }
        writingSpace.classList.add('one-point-five-space');
    } else if(spacing === "double") {
        if(writingSpace.classList.contains('single-space')) {
            writingSpace.classList.remove('single-space')
        }
        if(writingSpace.classList.contains('one-point-five-space')) {
            writingSpace.classList.remove('one-point-five-space')
        }
        if(writingSpace.classList.contains('double-space')) {
            writingSpace.classList.remove('double-space')
        }
        writingSpace.classList.add('double-space');
    }
    document.getElementById('line-spacing').style.display = "none";
    setGlobal({ document: doc });
}