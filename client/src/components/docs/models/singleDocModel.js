import { getMonthDayYear } from "../../shared/helpers/getMonthDayYear";
import { getGlobal } from 'reactn';
import { Value } from 'slate';
const initialValue = require('../views/editors/initialValue.json');

export async function singleDocModel(updates) {
    let singleDoc = getGlobal().singleDoc;
    let readOnlySource = updates.readOnly !== undefined ? "updates" : "doc";
    let rtcSource = updates.rtc !== undefined ? "updates" : "doc";
    let id;
    if(updates.id) {
        id = updates.id;
    } else {
        window.location.href.includes("new") ? id = window.location.href.split("new/")[1] : id = window.location.href.split("documents/")[1];
    }
    //Model
    let singleModel = await {
        id: singleDoc.id || id, 
        content: updates.content ? updates.content : getGlobal().content === "" ? Value.fromJSON(initialValue) : getGlobal().content,
        fileType: "documents", 
        lastUpdate: Date.now(), 
        updated: getMonthDayYear(), 
        readOnly: readOnlySource === "updates" ? updates.readOnly : singleDoc.readOnly,
        rtc: rtcSource === "updates" ? updates.rtc : singleDoc.rtc,
        sharedWith: updates.sharedWith ? updates.sharedWith :  singleDoc.sharedWith || [], 
        singleDocIsPublic: updates.singleDocIsPublic !==undefined ? updates.singleDocIsPublic : singleDoc.singleDocIsPublic ? singleDoc.singleDocIsPublic : false,
        singleDocTags: updates.singleDocTags ? updates.singleDocTags : singleDoc.singleDocTags || [], 
        teamDoc: false, 
        versions: singleDoc.versions ? updates.version ? [...singleDoc.versions, updates.version] : singleDoc.versions : [],
        title: getGlobal().title ? getGlobal().title : "Untitled"
    }
    //End Model
    return singleModel;
}