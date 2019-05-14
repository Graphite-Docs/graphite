import { getMonthDayYear } from "../../shared/helpers/getMonthDayYear";
import { getGlobal } from 'reactn';
import { Value } from 'slate';
const initialValue = require('../views/editors/initialValue.json');

export async function singleDocModel(updates) {
    let singleDoc = getGlobal().singleDoc;
    let readOnlySource = updates ? updates.readOnly !== undefined ? "updates" : "doc" : "doc";
    let rtcSource = updates ? updates.rtc !== undefined ? "updates" : "doc" : "doc";
    let id;
    if(updates) {
        if(updates.id) {
            id = updates.id;
        } else {
            window.location.href.includes("new") ? id = window.location.href.split("new/")[1] : id = window.location.href.split("documents/")[1];
        }
    } else {
        window.location.href.includes("new") ? id = window.location.href.split("new/")[1] : id = window.location.href.split("documents/")[1];
    }
    //Model
    let singleModel = await {
        id: singleDoc.id || id, 
        content: updates ? updates.content ? updates.content : getGlobal().content === "" ? Value.fromJSON(initialValue) : getGlobal().content : getGlobal().content,
        fileType: "documents", 
        lastUpdate: Date.now(), 
        updated: getMonthDayYear(), 
        readOnly: readOnlySource === "updates" ? updates.readOnly : singleDoc.readOnly,
        rtc: rtcSource === "updates" ? updates.rtc : singleDoc.rtc,
        sharedWith: updates ? updates.sharedWith ? updates.sharedWith :  singleDoc.sharedWith || [] : singleDoc.sharedWith || [], 
        singleDocIsPublic: updates ? updates.singleDocIsPublic !==undefined ? updates.singleDocIsPublic : singleDoc.singleDocIsPublic ? singleDoc.singleDocIsPublic : false : false,
        singleDocTags: updates ? updates.singleDocTags ? updates.singleDocTags : singleDoc.singleDocTags || [] : singleDoc.singleDocTags || [], 
        teamDoc: updates ? updates.teamDoc ? updates.teamDoc : singleDoc.teamDoc || false : singleDoc.teamDoc || false, 
        versions: singleDoc.versions ? updates ? updates.version ? [...singleDoc.versions, updates.version] : singleDoc.versions : singleDoc.versions : [],
        title: getGlobal().title ? getGlobal().title : "Untitled", 
        teams: getGlobal().singleDoc.teams ? getGlobal().singleDoc.teams : []
    }
    //End Model
    return singleModel;
}