import { getGlobal } from 'reactn';

export function fetchData(params) {
    const { userSession } = getGlobal();
    let fileName = params.fileName;
    if(params.options) {
        return userSession.getFile(fileName, params.options)
        .then((file) => {
            return file
        }).catch((err) => {
            console.log(err);
            return {
                err,
                message: "trouble fetching file"
            }
        })
    } else {
        return userSession.getFile(fileName, {decrypt: params.decrypt})
        .then((file) => {
            return file
        }).catch(error => console.log(fileName,error))
    }
}