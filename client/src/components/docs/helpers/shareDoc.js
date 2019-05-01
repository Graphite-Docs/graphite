import { getGlobal, setGlobal } from 'reactn';
import { ToastsStore} from 'react-toasts';
import { getMonthDayYear } from '../../shared/helpers/getMonthDayYear';
import { postData } from '../../shared/helpers/post';
import { saveDoc } from './singleDoc';
const wordCount = require('html-word-count');

export function stopSharing() {
  const singleDoc = getGlobal().singleDoc;
  const updates = {
    readOnly: true,
    singleDocIsPublic: false
  }
  setGlobal({ singleDoc, readOnly: true, singleDocIsPublic: false, singlePublic: {} });

  savePublic({showToast: "stopped"});
  saveDoc(updates);
}

export function sharePublicly(params) {
    let singleDoc = getGlobal().singleDoc;
    if (singleDoc.readOnly === undefined && getGlobal().readOnly === undefined) {
      setGlobal({ readOnly: true }, async () => {
        const object = {
          title: getGlobal().title,
          content: document.getElementsByClassName("editor")[0].innerHTML, 
          readOnly: true,
          words: wordCount(
            document
              .getElementsByClassName("editor")[0]
              .innerHTML.replace(/<(?:.|\n)*?>/gm, "")
          ), 
          shared: getMonthDayYear(), 
          singleDocIsPublic: true
        };
        singleDoc["singleDocIsPublic"] = true;
        singleDoc["readOnly"] = true;
        setGlobal(
          {
            singlePublic: object,
            singleDoc: singleDoc
          },
          () => {
            savePublic();
          }
        );
      });
    } else {
      const object = {};
      object.title = getGlobal().title;
      if (getGlobal().readOnly) {
        object.content = document.getElementsByClassName("editor")[0].innerHTML;
      } else {
        let content = getGlobal().content;
        object.content = content.toJSON();
      }
      object.readOnly = getGlobal().readOnly;
      object.words = wordCount(
        document
          .getElementsByClassName("editor")[0]
          .innerHTML.replace(/<(?:.|\n)*?>/gm, "")
      );
      object.shared = getMonthDayYear();
      object.singleDocIsPublic = true;
      singleDoc["singleDocIsPublic"] = true;
      singleDoc["readOnly"] = getGlobal().readOnly;
      setGlobal(
        {
          singlePublic: object,
          singleDoc: singleDoc
        },
        () => {
          savePublic({showToast: "shared"});
        }
      );
    }
    if(params) {
      saveDoc(params)
    } else {
      saveDoc({singleDocIsPublic: true})
    }
  }

  export async function savePublic(toast) {
    const { userSession } = getGlobal();
    const user = userSession.loadUserData().username;
    let id;
    window.location.href.includes("new") ? id = window.location.href.split("new/")[1] : id = window.location.href.split("documents/")[1];
    const directory = "public/";
    const file = directory + id + ".json";
    const link = `${window.location.origin}/shared/docs/${user}-${id}`;

    try {
        let pubDocParams = {
            fileName: file, 
            body: JSON.stringify(getGlobal().singlePublic), 
            encrypt: false
        }
        const publicDoc = await postData(pubDocParams);
        console.log(publicDoc);
        setGlobal({ gaiaLink: link});
        toast.showToast === "shared" ? ToastsStore.success(`Document shared publicly`) : toast.showToast === "stopped" ? ToastsStore.success(`Document no longer shared publicly`) : console.log("saved")
      } catch(error) {
        console.log(error)
      }
  }

  export function toggleReadOnly() {
    let doc = getGlobal().singleDoc;
    let currentStatus = doc.readOnly;
    //make this function toggleReadyOnly state instead, so user can press button again
    setGlobal({readOnly: !currentStatus}, () => {
      let params = {
        singleDocIsPublic: true, 
        readOnly: getGlobal().readOnly
      }
      sharePublicly(params);
    })
  }