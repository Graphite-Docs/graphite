import { getGlobal } from 'reactn';

export function postData(params) {
    const { userSession } = getGlobal();
    return userSession.putFile(params.fileName, params.body, {encrypt: params.encrypt})
    .then((file) => {
        return file
    }).catch(error => console.log(error))
}