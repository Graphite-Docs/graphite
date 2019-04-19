import { fetchData } from "../../shared/helpers/fetch";
import { setGlobal, getGlobal } from 'reactn';
import { postData } from '../../shared/helpers/post';
import { ToastsStore} from 'react-toasts';
import { getMonthDayYear } from '../../shared/helpers/getMonthDayYear';
import XLSX from "xlsx";
const mammoth = require("mammoth");
const str2ab = require("string-to-arraybuffer");
const rtfToHTML = require('./rtf-to-html');
const Papa = require('papaparse');
const uuid = require('uuidv4');
let abuf4;

export async function loadSingleSharedVault() {
    const { userSession } = getGlobal();
    setGlobal({ loading: true });
    const userToLoadFrom = window.location.href.split('user=')[1].split('&id')[0];
    const userShort = userSession.loadUserData().username.split('.').join('_');
    const fileName = "sharedvault.json";
    const privateKey = userSession.loadUserData().appPrivateKey;
    const options = { username: userToLoadFrom, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
    let fileParams = {
        fileName: `/shared/${userShort + fileName}`, 
        options
    }
    const sharedCollection = await fetchData(fileParams);
    const decryptedContent = JSON.parse(userSession.decryptContent(JSON.parse(sharedCollection), {privateKey: privateKey}));
    let thisFile = decryptedContent.filter(a => a.id === window.location.href.split('id=')[1]);
    if(thisFile) {
        const singleFile = thisFile[0];
        await setGlobal({
            file: singleFile, 
            singleFile: singleFile,
            name: singleFile.name, 
            type: singleFile.type,
            link: singleFile.link
        })
        if (getGlobal().type.includes("word")) {
            abuf4 = str2ab(getGlobal().link);
            mammoth
              .convertToHtml({ arrayBuffer: abuf4 })
              .then(result => {
                var html = result.value; // The generated HTML
                setGlobal({ content: html });
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
          setGlobal({ loading: false });
    }
  }

  export async function addToVault() {
      const file = getGlobal().singleFile;
      const files = getGlobal().files;
      const id = uuid();
      //first we save the single file to our hub
      const singleParams = {
          fileName: `${id}.json`, 
          encrypt: true, 
          body: JSON.stringify(file)
      }
      const postedFile = await postData(singleParams);
      console.log(postedFile);

      //now we update the file index
      const indexObject = {
        uploaded: getMonthDayYear(),
        timestamp: Date.now(), 
        name: file.name,
        size: file.size,
        type: file.type,
        tags: [],
        sharedWithSingle: [],
        lastModified: file.lastModified,
        lastModifiedDate: file.lastModifiedDate,
        publicVaultFile: file.publicVaultFile,
        id, 
        fileType: "vault"
    }
    await setGlobal({files: [...files, indexObject], filteredFiles: [...getGlobal().filteredFiles, indexObject]});
    let fileIndexParams = {
        fileName: 'uploads.json', 
        encrypt: true, 
        body: JSON.stringify(getGlobal().files)
    }
    const postedIndex = await postData(fileIndexParams);
    console.log(postedIndex);
    ToastsStore.success(`File added to Vault!`);
  }