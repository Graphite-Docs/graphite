import { getMonthDayYear } from "../../shared/helpers/getMonthDayYear";
import { getGlobal } from 'reactn';

export async function documentModel(updates) {
    const { title, singleDoc } = await getGlobal();
    let id;
    window.location.href.includes("new") ? id = window.location.href.split("new/")[1] : id = window.location.href.split("documents/")[1];
    let documentModel = await {
        id: updates ? updates.id ? updates.id : singleDoc.id || id : singleDoc.id || id, 
        fileType: "documents", 
        lastUpdate: Date.now(), 
        updated: getMonthDayYear(), 
        readOnly: singleDoc.readOnly ? updates ? updates.readOnly ? updates.readOnly : singleDoc.readOnly : singleDoc.readOnly : true,
        rtc: singleDoc.rtc ? updates ? updates.rtc ? updates.rtc : singleDoc.rtc : singleDoc.rtc : false,
        sharedWith: updates ? updates.sharedWith ? updates.sharedWith : singleDoc.sharedWith || [] : singleDoc.sharedWith || [], 
        singleDocIsPublic: singleDoc.singleDocIsPublic ? updates ? updates.singleDocIsPublic ? updates.singleDocIsPublic : singleDoc.singleDocIsPublic : singleDoc.singleDocIsPublic : false,
        singleDocTags: updates ? updates.singleDocTags ? updates.singleDocTags : singleDoc.singleDocTags || [] : singleDoc.singleDocTags || [], 
        teamDoc: false, 
        versions: singleDoc.versions ? updates ? updates.version ? [...singleDoc.versions, updates.version] : singleDoc.versions : singleDoc.versions : [],
        title: title ? title : "Untitled"
    }
    return documentModel;
}