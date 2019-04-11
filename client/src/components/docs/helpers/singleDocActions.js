import {getGlobal} from 'reactn';
const htmlDocx = require("html-docx-js/dist/html-docx");
const FileSaver = require("file-saver");
const doc = new window.jsPDF('p', 'pt', 'a4');

export function downloadDoc(props) {
    if (props === "word") {
      var content =
        "<!DOCTYPE html>" +
        document.getElementsByClassName("editor")[0].innerHTML;
      var converted = htmlDocx.asBlob(content);
      var blob = new Blob([converted], { type: "application/msword" });
      FileSaver.saveAs(blob, getGlobal().title + ".docx");
    } else if (props === "rtf") {
      console.log("rtf");
    } else if (props === "pdf") {
        doc.fromHTML(document.getElementsByClassName("editor")[0], 15, 15, {
            'width': 250,
            'margin': 1,
            'pagesplit': true, //This will work for multiple pages
            'elementHandlers': {}
            });
                
        doc.save(`${getGlobal().title.replace(" ", "_")}.pdf`);
    } else if (props === "txt") {
      window.open(
        "data:application/txt," +
          encodeURIComponent(
            document
              .getElementsByClassName("editor")[0]
              .innerHTML.replace(/<[^>]+>/g, "")
          ),
        "_self"
      );
    }
  }

  export function print() {
    window.print();
  }