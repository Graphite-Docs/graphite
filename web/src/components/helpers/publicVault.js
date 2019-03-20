import { setGlobal, getGlobal } from 'reactn';
import { fetchFromProvider } from './storageProviders/fetch';
import { getFile } from 'blockstack';
import XLSX from "xlsx";
const mammoth = require("mammoth");
const str2ab = require("string-to-arraybuffer");
const rtfToHTML = require('../vault/rtf-to-html.js');
const Papa = require('papaparse');
let abuf4;

export function loadPublicVault() {
  setGlobal({ loading: true });
  const user = window.location.href.split('vault/')[1].split('/')[0].split('#')[0];
  const fileName = 'public/vault/' + window.location.href.split('vault/')[1].split('/')[1].split('#')[0];
  if(window.location.href.includes('did:')) {
    const object = {
      provider: 'ipfs',
      filePath: `/${fileName}.json`
    };
    //Call fetchFromProvider and wait for response.
    // let fetchFile = await fetchFromProvider(object);
    fetchFromProvider(object)
      .then((res) => {
        const data = JSON.parse(res.data.pinataContent.content);
        console.log(data)
        setGlobal({
          file: data,
          name: data.name,
          lastModifiedDate: data.lastModifiedDate,
          size: data.size,
          link: data.link,
          type: data.type,
          sharedWith: data.sharedWith,
          tags: data.tags,
          publicVaultFile: data.publicVaultFile || false,
          pubVaultShared: true
        }, 
        () => {
          if (getGlobal().type.includes("word")) {
            abuf4 = str2ab(getGlobal().link);
            mammoth
              .convertToHtml({ arrayBuffer: abuf4 })
              .then(result => {
                var html = result.value; // The generated HTML
                setGlobal({ content: html });
                console.log(getGlobal().content);
                setGlobal({ loading: false });
              })
              .done();
          }

          else if (getGlobal().type.includes("rtf")) {
            let base64 = getGlobal().link.split("data:text/rtf;base64,")[1];
            rtfToHTML.fromString(window.atob(base64), (err, html) => {
              console.log(window.atob(base64));
              console.log(html)
              let htmlFixed = html.replace("body", ".noclass");
              setGlobal({ content:  htmlFixed});
              setGlobal({ loading: "hide", show: "" });
            })
          }

          else if (getGlobal().type.includes("text/plain")) {
            let base64 = getGlobal().link.split("data:text/plain;base64,")[1];
            setGlobal({ loading: "hide", show: "" });
            setGlobal({ content: window.atob(base64) });
          }

          else if (getGlobal().type.includes("sheet")) {
            abuf4 = str2ab(getGlobal().link);
            var wb = XLSX.read(abuf4, { type: "buffer" });
            var first_worksheet = wb.Sheets[wb.SheetNames[0]];
            var data = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
            setGlobal({ grid: data });
            setGlobal({ loading: "hide", show: "" });
          }

          else if (getGlobal().type.includes("csv")) {
            let base64 = getGlobal().link.split("data:text/csv;base64,")[1];
            setGlobal({ grid: Papa.parse(window.atob(base64)).data });
            setGlobal({ loading: "hide", show: "" });
          }

          else {
            setGlobal({ loading: false });
          }
          setGlobal({ loading: false })
        })
      })
  } else {
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    getFile(fileName + '.json', options)
      .then((file) => {
        if(JSON.parse(file).type) {
          setGlobal({ loading: true });
              setGlobal({
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
              if (getGlobal().type.includes("word")) {
                abuf4 = str2ab(getGlobal().link);
                mammoth
                  .convertToHtml({ arrayBuffer: abuf4 })
                  .then(result => {
                    var html = result.value; // The generated HTML
                    setGlobal({ content: html });
                    console.log(getGlobal().content);
                    setGlobal({ loading: false });
                  })
                  .done();
              }
  
              else if (getGlobal().type.includes("rtf")) {
                let base64 = getGlobal().link.split("data:text/rtf;base64,")[1];
                rtfToHTML.fromString(window.atob(base64), (err, html) => {
                  console.log(window.atob(base64));
                  console.log(html)
                  let htmlFixed = html.replace("body", ".noclass");
                  setGlobal({ content:  htmlFixed});
                  setGlobal({ loading: "hide", show: "" });
                })
              }
  
              else if (getGlobal().type.includes("text/plain")) {
                let base64 = getGlobal().link.split("data:text/plain;base64,")[1];
                setGlobal({ loading: "hide", show: "" });
                setGlobal({ content: window.atob(base64) });
              }
  
              else if (getGlobal().type.includes("sheet")) {
                abuf4 = str2ab(getGlobal().link);
                var wb = XLSX.read(abuf4, { type: "buffer" });
                var first_worksheet = wb.Sheets[wb.SheetNames[0]];
                var data = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
                setGlobal({ grid: data });
                setGlobal({ loading: "hide", show: "" });
              }
  
              else if (getGlobal().type.includes("csv")) {
                let base64 = getGlobal().link.split("data:text/csv;base64,")[1];
                setGlobal({ grid: Papa.parse(window.atob(base64)).data });
                setGlobal({ loading: "hide", show: "" });
              }
  
              else {
                setGlobal({ loading: false });
              }
        } else {
          setGlobal({
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
        setGlobal({ loading: false });
      })
      .catch(error => console.log(error))
  }
}
