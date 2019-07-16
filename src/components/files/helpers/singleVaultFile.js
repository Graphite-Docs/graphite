import { fetchData } from '../../shared/helpers/fetch';
import { setGlobal, getGlobal } from 'reactn';
import { postData } from '../../shared/helpers/post';
import { ToastsStore} from 'react-toasts';
import update from 'immutability-helper';
import XLSX from "xlsx";
import { getMonthDayYear } from '../../shared/helpers/getMonthDayYear';
import { getPublicKeyFromPrivate } from 'blockstack/lib/keys';
import axios from 'axios';
const blockstack = require('blockstack');
const mammoth = require("mammoth");
const uuid = require('uuidv4');
const str2ab = require("string-to-arraybuffer");
const rtfToHTML = require('./rtf-to-html');
const Papa = require('papaparse');
let abuf4;
var FileSaver = require('file-saver');
let timer = null;

export async function loadSingleVaultFile() {
    let wb;
    let first_worksheet;
    let data;
    const { userSession } = getGlobal();
    if(window.location.href.includes('documents')) {
      setGlobal({ loading: false });
    } else {
      setGlobal({loading: true})
    }

    if(window.location.href.includes('team')) {
      //First we need to get the team key for decryption
      const teamId = window.location.href.split('team/')[1].split('/')[0];
      const fileId = window.location.href.split('team/')[1].split('/')[1];
      const teamKeyParams = {
        fileName: `user/${userSession.loadUserData().username.split('.').join('_')}/team/${teamId}/key.json`,
        decrypt: true,
      }
      const fetchedKeys = await fetchData(teamKeyParams);
      //then we need to know who to fetch the file from
      const teamFiles = getGlobal().teamFiles;
      if(teamFiles.length > 0) {
        //On refresh, team docs won't be loaded right away, so need to check for them.
        const index = await teamFiles.map((x) => {return x.id }).indexOf(fileId);
        const thisFile = teamFiles[index];
        const userHub = thisFile.currentHostBucket;
        const teamFile = {
          fileName: `teamFiles/${teamId}/${fileId}.json`,
          options: { username: userHub, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
        }
        const encryptedFile = await fetchData(teamFile);
        const decryptedFile = userSession.decryptContent(JSON.parse(encryptedFile), {privateKey: JSON.parse(fetchedKeys).private});
        await setGlobal({
          singleFile: JSON.parse(decryptedFile),
          file: JSON.parse(decryptedFile),
          name: JSON.parse(decryptedFile).name,
          type: JSON.parse(decryptedFile).file.type,
          link: JSON.parse(decryptedFile).file.link
        });
        if (getGlobal().type.includes("word")) {
          abuf4 = str2ab(getGlobal().link);
          mammoth
            .convertToHtml({ arrayBuffer: abuf4 })
            .then(result => {
              var html = result.value; // The generated HTML
              setGlobal({ singleFileContent: html });
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
            setGlobal({ singleFileContent:  htmlFixed});
            setGlobal({ loading: "hide", show: "" });
          })
        }

        else if (getGlobal().type.includes("text/plain")) {
          let base64 = getGlobal().link.split("data:text/plain;base64,")[1];
          setGlobal({ loading: "hide", show: "" });
          setGlobal({ singleFileContent: window.atob(base64) });
        }

        else if (getGlobal().type.includes("sheet")) {
          abuf4 = str2ab(getGlobal().link);
          wb = XLSX.read(abuf4, { type: "buffer" });
          first_worksheet = wb.Sheets[wb.SheetNames[0]];
          data = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });

          setGlobal({ grid: data });
          setGlobal({ loading: "hide", show: "" });
        }

        else if (getGlobal().type.includes("csv")) {
          let base64 = getGlobal().link.split("data:text/csv;base64,")[1];
          setGlobal({ grid: Papa.parse(window.atob(base64)).data });
          setGlobal({ loading: "hide", show: "" });
        }
        setGlobal({ loading: false });
      } else {
        console.log("No team files...")
        //Need to figure out how to handle this better.
      }

      } else {
        const fileId = window.location.href.split('files/')[1];
        const file = `${fileId}.json`
        const fileParams = {
            fileName: file,
            decrypt: true
        }

        let thisFile = await fetchData(fileParams);
        await setGlobal({
            file: JSON.parse(thisFile),
            singleFile: JSON.parse(thisFile),
            name: JSON.parse(thisFile).name,
            type: JSON.parse(thisFile).type,
            link: JSON.parse(thisFile).link
        })
        if (getGlobal().type.includes("word")) {
            abuf4 = str2ab(getGlobal().link);
            mammoth
              .convertToHtml({ arrayBuffer: abuf4 })
              .then(result => {
                var html = result.value; // The generated HTML
                setGlobal({ singleFileContent: html });
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
              setGlobal({ singleFileContent:  htmlFixed});
              setGlobal({ loading: "hide", show: "" });
            })
          }

          else if (getGlobal().type.includes("text/plain")) {
            let base64 = getGlobal().link.split("data:text/plain;base64,")[1];
            setGlobal({ loading: "hide", show: "" });
            setGlobal({ singleFileContent: window.atob(base64) });
          }

          else if (getGlobal().type.includes("sheet")) {
            abuf4 = str2ab(getGlobal().link);
            wb = XLSX.read(abuf4, { type: "buffer" });
            first_worksheet = wb.Sheets[wb.SheetNames[0]];
            data = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });

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

export async function downloadPDF() {
    var oReq = new XMLHttpRequest();
    var URLToPDF = getGlobal().singleFile.link;

    // Configure XMLHttpRequest
    oReq.open("GET", URLToPDF, true);

    // Important to use the blob response type
    oReq.responseType = "blob";

    // When the file request finishes
    // Is up to you, the configuration for error events etc.
    oReq.onload = function() {
        // Once the file is downloaded, open a new window with the PDF
        // Remember to allow the POP-UPS in your browser
        var file = new Blob([oReq.response], {
            type: 'application/pdf'
        });

        // Generate file download directly in the browser !
        FileSaver.saveAs(file, getGlobal().name);
    };

    oReq.send();
}

export function onDocumentComplete(pages) {
    setGlobal({ page: 1, pages });
}

export function onPageComplete(page) {
    setGlobal({ page });
}

export async function signWithBlockusign(fileId) {
    const { userSession } = getGlobal();
    const options = { username: userSession.loadUserData().username, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false, app: 'https://blockusign.co'}
    try {
        let dataParams = {
            fileName: 'key.json',
            options,
            decrypt: false
        }
        let thisKey = await fetchData(dataParams);
        if(thisKey) {
            const data = JSON.stringify(getGlobal().singleFile);
            const encryptedData = userSession.encryptContent(data, {publicKey: JSON.parse(thisKey)})

            let postParams = {
                fileName: `blockusign/${fileId}`,
                encrypt: false,
                body: JSON.stringify(encryptedData)
            }

            let postedData = await postData(postParams);
            console.log(postedData);
        } else {
            ToastsStore.error(`It looks like you've never signed into Blockusign before. Please do so first.`)
        }
    } catch(error) {
        console.log(error);
    }
  }

  export async function shareVaultFile() {
    ToastsStore.success(`Creating public link...`)
    let fileName = `public/files/${window.location.href.split('files/')[1].split('#')[0]}.json`;
    let singleFile = await getGlobal().singleFile;
    singleFile["publicVaultFile"] = true;
    await setGlobal({ singleFile, publicVaultFile: true });
    //First we save the single file with its updates.
    await saveFile();
    //Now we save the file publicly
    const publicParams = {
        fileName,
        encrypt: false,
        body: JSON.stringify(singleFile)
    }
    const postedPublic = await postData(publicParams);
    console.log(postedPublic);
    //Finally, we update the fileIndex
    ToastsStore.success(`File shared publicly!`)
  }

  export async function stopSharingPubVaultFile() {
    ToastsStore.success(`Removing access...`)
    let fileName = `public/files/${window.location.href.split('files/')[1]}.json`;
    let singleFile = await getGlobal().singleFile;
    singleFile["publicVaultFile"] = false;
    await setGlobal({ singleFile, publicVaultFile: false});

    await saveFile();

    let publicParams = {
        fileName,
        encrypt: false,
        body: JSON.stringify({})
    }
    const postedPublic = await postData(publicParams);
    console.log(postedPublic);

    ToastsStore.success(`File no longer shared publicly`)
  }

  export async function handleName(e) {
    let name = e.target.value;
    let singleFile = await getGlobal().singleFile;
    singleFile["name"] = name;
    await setGlobal({ name, singleFile });
    clearTimeout(timer);
    timer = setTimeout(() => saveFile(), 1500);
  }

  export async function saveFile() {
    let singleFile = await getGlobal().singleFile;
    let singleFileParams = {
        fileName: `${window.location.href.split('files/')[1]}.json`,
        encrypt: true,
        body: JSON.stringify(singleFile)
    }
    const postedFile = await postData(singleFileParams);
    console.log(postedFile);
    await saveIndex();
  }

  export async function saveIndex() {
    let files = await getGlobal().files;
    let file = await getGlobal().singleFile;
    const indexObject = {
        uploaded: file.uploaded,
        timestamp: Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        tags: file.tags,
        sharedWithSingle: file.sharedWithSingle,
        lastModified: file.lastModified,
        lastModifiedDate: file.lastModifiedDate,
        publicVaultFile: file.publicVaultFile,
        id: file.id,
        fileType: "vault"
    }
    let index = await files.map((x) => {return x.id }).indexOf(window.location.href.split('files/')[1]);
    if(index > -1) {
      const updatedFiles = update(getGlobal().files, {$splice: [[index, 1, indexObject]]});
      await setGlobal({files: updatedFiles, filteredFiles: updatedFiles});
    } else {
      console.log("Error doc index")
    }
    let fileIndexParams = {
        fileName: 'uploads.json',
        encrypt: true,
        body: JSON.stringify(getGlobal().files)
    }
    const postedIndex = await postData(fileIndexParams);
    console.log(postedIndex);
  }

  export function handlePrevious (props){
    setGlobal({ page: props })
  }

  export async function addToDocs() {
    ToastsStore.success(`Adding to Documents...`)
    const singleFile = await getGlobal().singleFile;
    const content = await getGlobal().singleFileContent;
    const id = uuid();
    let singleModel = {
      id: id,
      content,
      fileType: "documents",
      lastUpdate: Date.now(),
      updated: getMonthDayYear(),
      readOnly: true,
      rtc: false,
      sharedWith: [],
      singleDocIsPublic: false,
      singleDocTags: [],
      teamDoc: false,
      versions: [],
      title: singleFile.name,
      compressed: true
  }
    let fileName = `/documents/${id}.json`;
    let docParams = {
        fileName,
        body: JSON.stringify(singleModel),
        encrypt: true
    }
    const updatedDoc = await postData(docParams);
    console.log(updatedDoc);

    //Now we update the index file;
    let docs = await getGlobal().documents;
    let docObject = {
      id: id,
      fileType: "documents",
      lastUpdate: Date.now(),
      updated: getMonthDayYear(),
      readOnly: true,
      rtc: false,
      sharedWith: [],
      singleDocIsPublic: false,
      singleDocTags: [],
      teamDoc: false,
      versions: [],
      title: singleFile.name
    }

    await setGlobal({ documents: [...docs, docObject], filteredDocs: [...getGlobal().filteredDocs, docObject]})

    let indexParams = {
      fileName: 'documentscollection.json',
      body: JSON.stringify(getGlobal().documents),
      encrypt: true
    }

    const postedDocIndex = await postData(indexParams);
    console.log(postedDocIndex);
    ToastsStore.success(`Documented added!`)
  }

  export async function shareWithTeam(data) {
    setGlobal({ teamShare: true });
    const { userSession, proOrgInfo } = getGlobal();
    let fileId;
    if(window.location.href.includes('team')) {
      fileId = window.location.href.split('team/')[1].split('/')[1];
    } else {
      fileId = window.location.href.split('files/')[1];
    }
    //First we need to fetch the teamKey
    const teamKeyParams = {
      fileName: `user/${userSession.loadUserData().username.split('.').join('_')}/team/${data.teamId}/key.json`,
      decrypt: true
    }
    const fetchedKeys = await fetchData(teamKeyParams);

    const file = {
      id: fileId,
      team: data.teamId,
      orgId: proOrgInfo.orgId,
      name: getGlobal().name,
      file: getGlobal().singleFile,
      currentHostBucket: userSession.loadUserData().username
    }
    const encryptedTeamFile = userSession.encryptContent(JSON.stringify(file), {publicKey: JSON.parse(fetchedKeys).public})

    const teamFile = {
      fileName: `teamFiles/${data.teamId}/${fileId}.json`,
      encrypt: false,
      body: JSON.stringify(encryptedTeamFile)
    }
    const postedTeamFile = await postData(teamFile);
    console.log(postedTeamFile);

    let singleFile = getGlobal().singleFile;
    singleFile["teamFile"] = true;
    await setGlobal({ singleFile });
    await saveFile();

    const privateKey = userSession.loadUserData().appPrivateKey;

    const syncedFile = {
      id: fileId,
      name: userSession.encryptContent(getGlobal().name, {publicKey: JSON.parse(fetchedKeys).public}),
      teamName: userSession.encryptContent(data.teamName, {publicKey: JSON.parse(fetchedKeys).public}),
      orgId: proOrgInfo.orgId,
      teamId: data.teamId,
      lastUpdated: getMonthDayYear(),
      timestamp: Date.now(),
      currentHostBucket: userSession.encryptContent(userSession.loadUserData().username, {publicKey: JSON.parse(fetchedKeys).public}),
      pubKey: getPublicKeyFromPrivate(privateKey)
    }

      const tokenData = {
          profile: userSession.loadUserData().profile,
          username: userSession.loadUserData().username,
          pubKey: getPublicKeyFromPrivate(privateKey)
      }
      const bearer = blockstack.signProfileToken(tokenData, userSession.loadUserData().appPrivateKey);

      const headerObj = {
          headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
              'Authorization': bearer
          },
      }
      axios.post(`/account/organization/${proOrgInfo.orgId}/files`, JSON.stringify(syncedFile), headerObj)
          .then(async (res) => {
              console.log(res.data)
              if(res.data.success === false) {
                  ToastsStore.error(res.data.message);
              } else {
                setGlobal({ teamShare: false, teamListModalOpen: false });
                if(data.initialShare === true) {
                  ToastsStore.success(`File shared with team: ${data.teamName}`);
                }
              }
          }).catch((error) => {
              console.log(error);
              if(data.initialShare === true) {
                ToastsStore.error(`Trouble sharing file`);
              }
          })
  }
