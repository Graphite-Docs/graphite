import { getFile } from 'blockstack';
import XLSX from "xlsx";
const mammoth = require("mammoth");
const str2ab = require("string-to-arraybuffer");
const rtfToHTML = require('../vault/rtf-to-html.js');
const Papa = require('papaparse');
let abuf4;

export function loadPublicVault() {
  const user = window.location.href.split('vault/')[1].split('/')[0]
  const fileName = 'public/vault/' + window.location.href.split('vault/')[1].split('/')[1];
  const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
  getFile(fileName, options)
    .then((file) => {
      if(JSON.parse(file).type) {
        this.setState({ loading: true });
            this.setState({
              file: JSON.parse(file || "{}"),
              name: JSON.parse(file || "{}").name,
              lastModifiedDate: JSON.parse(file || "{}").lastModifiedDate,
              size: JSON.parse(file || "{}").size,
              link: JSON.parse(file || "{}").link,
              type: JSON.parse(file || "{}").type,
              sharedWith: JSON.parse(file || "{}").sharedWith,
              tags: JSON.parse(file || "{}").tags,
              publicVaultFile: JSON.parse(file).publicVaultFile || false,
              pubVaultShared: true
            });
            if (this.state.type.includes("word")) {
              abuf4 = str2ab(this.state.link);
              mammoth
                .convertToHtml({ arrayBuffer: abuf4 })
                .then(result => {
                  var html = result.value; // The generated HTML
                  this.setState({ content: html });
                  console.log(this.state.content);
                  this.setState({ loading: false });
                })
                .done();
            }

            else if (this.state.type.includes("rtf")) {
              let base64 = this.state.link.split("data:text/rtf;base64,")[1];
              rtfToHTML.fromString(window.atob(base64), (err, html) => {
                console.log(window.atob(base64));
                console.log(html)
                let htmlFixed = html.replace("body", ".noclass");
                this.setState({ content:  htmlFixed});
                this.setState({ loading: "hide", show: "" });
              })
            }

            else if (this.state.type.includes("text/plain")) {
              let base64 = this.state.link.split("data:text/plain;base64,")[1];
              this.setState({ loading: "hide", show: "" });
              this.setState({ content: window.atob(base64) });
            }

            else if (this.state.type.includes("sheet")) {
              abuf4 = str2ab(this.state.link);
              var wb = XLSX.read(abuf4, { type: "buffer" });
              var first_worksheet = wb.Sheets[wb.SheetNames[0]];
              var data = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
              this.setState({ grid: data });
              this.setState({ loading: "hide", show: "" });
            }

            else if (this.state.type.includes("csv")) {
              let base64 = this.state.link.split("data:text/csv;base64,")[1];
              this.setState({ grid: Papa.parse(window.atob(base64)).data });
              this.setState({ loading: "hide", show: "" });
            }

            else {
              this.setState({ loading: false });
            }
      } else {
        this.setState({
          file: JSON.parse(file || "{}"),
          name: JSON.parse(file || "{}").name,
          lastModifiedDate: JSON.parse(file || "{}").lastModifiedDate,
          size: JSON.parse(file || "{}").size,
          link: JSON.parse(file || "{}").link,
          type: JSON.parse(file || "{}").type,
          sharedWith: JSON.parse(file || "{}").sharedWith,
          tags: JSON.parse(file || "{}").tags,
          publicVaultFile: JSON.parse(file).publicVaultFile || false,
          pubVaultShared: false
        });
      }
    })
    .then(() => {
      this.setState({ loading: false });
    })
    .catch(error => console.log(error))
}
