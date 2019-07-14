import { setGlobal, getGlobal } from 'reactn';
import XLSX from "xlsx";
import { fetchData } from '../../shared/helpers/fetch.js';
const mammoth = require("mammoth");
const str2ab = require("string-to-arraybuffer");
const rtfToHTML = require('./rtf-to-html.js');
const Papa = require('papaparse');
let abuf4;

export async function loadPublicVault() {
    setGlobal({ loading: true });
    const user = window.location.href.split('files/')[1].split('/')[0].split('#')[0];
    console.log(user);
    const fileName = `public/files/${window.location.href.split('files/')[1].split('/')[1].split('#')[0]}.json`;
    const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    const fileParams = {
        fileName, 
        options
    }
    const fetchedFile = await fetchData(fileParams);
    if(JSON.parse(fetchedFile).type) {
        setGlobal({ loading: true });
            setGlobal({
            file: JSON.parse(fetchedFile),
            name: JSON.parse(fetchedFile).name,
            lastModifiedDate: JSON.parse(fetchedFile).lastModifiedDate,
            size: JSON.parse(fetchedFile).size,
            link: JSON.parse(fetchedFile).link,
            type: JSON.parse(fetchedFile).type,
            sharedWith: JSON.parse(fetchedFile).sharedWith,
            tags: JSON.parse(fetchedFile).tags,
            publicVaultFile: JSON.parse(fetchedFile).publicVaultFile || false,
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
        file: JSON.parse(fetchedFile),
        name: JSON.parse(fetchedFile).name,
        lastModifiedDate: JSON.parse(fetchedFile).lastModifiedDate,
        size: JSON.parse(fetchedFile).size,
        link: JSON.parse(fetchedFile).link,
        type: JSON.parse(fetchedFile).type,
        sharedWith: JSON.parse(fetchedFile).sharedWith,
        tags: JSON.parse(fetchedFile).tags,
        publicVaultFile: JSON.parse(fetchedFile).publicVaultFile || false,
        pubVaultShared: false
        });
    }
}