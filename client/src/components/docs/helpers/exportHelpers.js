import { saveAs } from 'file-saver';
import { getGlobal } from 'reactn';
import { convertHtmlToRtf } from './htmltortf';
const htmlDocx = require('html-docx-js/dist/html-docx');

export function exportAsWord() {
    document.getElementById('file-drop').style.display = "none";
    const content = document.getElementById('editor-section').innerHTML;
    const converted = htmlDocx.asBlob(content);
    saveAs(converted, `${getGlobal().title.split(' ').join('_')}.docx`);
}

export function exportAsRTF() {
    document.getElementById('file-drop').style.display = "none";
    const content = document.getElementById('editor-section').innerHTML;
    const converted = convertHtmlToRtf(content);
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(converted));
    element.setAttribute('download', `${getGlobal().title.split(' ').join('_')}.rtf`);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

export function exportAsTXT() {
    document.getElementById('file-drop').style.display = "none";
    var html = document.getElementById('editor-section').innerHTML;;
    var div = document.createElement("div");
    div.innerHTML = html;
    var text = div.textContent || div.innerText || "";
    
    var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
    saveAs(blob, `${getGlobal().title.split(' ').join('_')}.txt`);
}

export function exportAsPDF() {
    // document.getElementById('file-drop').style.display = "none";
    // const pdf = new Pdf({
    //     tmpConfig: { dir: `${os.homedir()}/downloads` }, 
    //     pdfFilePath: `${os.homedir()}/downloads/test.pdf`,
    //     header: {
    //         height: '1cm',
    //         contents: "<strong style='color: red'>Page ${pageNumber} of ${numberOfPages} - ${pageNumber}</strong>"
    //     },
    //     footer: {
    //         height: '1cm',
    //         contents: 'footer <strong>Page ${pageNumber} of ${numberOfPages}</strong>'
    //     },
    //     margin: '1.0cm'
    // });
    // const content = document.getElementById('editor-section').innerHTML;
    // pdf.createFromHtmlString(content).then((pdfFile) => {
    //     console.log(pdfFile);
    // });
}