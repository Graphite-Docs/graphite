import axios from "axios";
import { ToastsStore} from 'react-toasts';
import { setGlobal } from 'reactn';

export async function getNotified() {
    const name = document.getElementById('trial-name').value;
    const organization = document.getElementById('trial-org').value;
    const email = document.getElementById('trial-email').value;
    const trialObject = {
        name, 
        organization, 
        email
    }
    await axios.post('https://wt-3fc6875d06541ef8d0e9ab2dfcf85d23-0.sandbox.auth0-extend.com/trial-notification', JSON.stringify(trialObject))
        .then((res) => {
            console.log(res);
            document.getElementById('trial-name').value = "";
            document.getElementById('trial-org').value = "";
            document.getElementById('trial-email').email = "";
            setGlobal({ getNotifiedModalOpen: false })
            ToastsStore.success(`You've been added to the list!`);
        }).catch(error => console.log(error))
}