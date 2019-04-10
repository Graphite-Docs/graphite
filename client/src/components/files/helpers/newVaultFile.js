import {getGlobal, setGlobal} from 'reactn';
import { postData } from '../../shared/helpers/post';
import { getMonthDayYear } from '../../shared/helpers/getMonthDayYear';
import { ToastsStore} from 'react-toasts';
import XLSX from 'xlsx';
const str2ab = require('string-to-arraybuffer');
const uuid = require('uuidv4');

export async function handleVaultDrop(files) {
    var file = files[0]
    const reader = new FileReader();
    reader.onload = (event) => {
        const fileObject = {
            file: file, 
            updloaded: getMonthDayYear(),
            timestamp: Date.now(), 
            link: event.target.result, 
            name: file.name,
            size: file.size,
            type: file.type,
            tags: [],
            sharedWithSingle: [],
            lastModified: file.lastModified,
            lastModifiedDate: file.lastModifiedDate,
            id: uuid(), 
            fileType: "vault"
        };
        const indexObject = {
            updloaded: getMonthDayYear(),
            timestamp: Date.now(), 
            name: file.name,
            size: file.size,
            type: file.type,
            tags: [],
            sharedWithSingle: [],
            lastModified: file.lastModified,
            lastModifiedDate: file.lastModifiedDate,
            id: fileObject.id, 
            fileType: "vault"
        }

        setGlobal({id: fileObject.id, name: fileObject.name});
        if(fileObject.type.includes('sheet')) {
        var abuf4 = str2ab(fileObject.link)
            var wb = XLSX.read(abuf4, {type:'buffer'});
            setGlobal({ grid: wb.Strings })
            fileObject.grid = getGlobal().grid;
        } else {
        console.log("not a spreadsheet");
        }
        if(fileObject.size > 10000000) {
            //File greater than 10mb
            ToastsStore.error(`File larger than 10mb :(`)

        }else {
        setGlobal({singleFile: fileObject, files: [...getGlobal().files, indexObject], link: fileObject.link, file: fileObject.file }, async () => {
                const file = getGlobal().singleFile;
                let filePath = `${file.id}.json`;
                let fileParams = {
                    fileName: filePath, 
                    body: JSON.stringify(file), 
                    encrypt: true
                }
                const vaultFile = await postData(fileParams);
                console.log(vaultFile);
                const indexFile = 'uploads.json';
                let indexParams = {
                    fileName: indexFile, 
                    body: JSON.stringify(files), 
                    encrypt: true
                }
                const vaultIndex = await postData(indexParams);
                console.log(vaultIndex);
            });
        }
    };
    reader.readAsDataURL(file);
}