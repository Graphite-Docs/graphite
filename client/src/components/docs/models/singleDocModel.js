import { getMonthDayYear } from "../../shared/helpers/getMonthDayYear";
import { getGlobal } from 'reactn';
import { Value } from 'slate';
const initialValue = require('../views/editors/initialValue.json');

export async function singleDocModel(updates) {
    const { content, title, singleDoc } = await getGlobal();
    let id;
    window.location.href.includes("new") ? id = window.location.href.split("new/")[1] : id = window.location.href.split("documents/")[1];
    let singleModel = await {
        id: singleDoc.id || id, 
        content: content === "" ? Value.fromJSON(initialValue) : content,
        fileType: "documents", 
        lastUpdate: Date.now(), 
        updated: getMonthDayYear(), 
        readOnly: singleDoc.readOnly ? updates.readOnly ? updates.readOnly : singleDoc.readOnly : true,
        rtc: singleDoc.rtc ? updates.rtc ? updates.rtc : singleDoc.rtc : false,
        sharedWith: updates.sharedWith ? updates.sharedWith :  singleDoc.sharedWith || [], 
        singleDocIsPublic: singleDoc.singleDocIsPublic ? updates.singleDocIsPublic ? updates.singleDocIsPublic : singleDoc.singleDocIsPublic : false,
        singleDocTags: updates.singleDocTags ? updates.singleDocTags : singleDoc.singleDocTags || [], 
        teamDoc: false, 
        versions: singleDoc.versions ? updates.version ? [...singleDoc.versions, updates.version] : singleDoc.versions : [],
        title: title ? title : "Untitled"
    }
    return singleModel;
}