import { fetchData } from '../../shared/helpers/fetch';
import { setGlobal } from 'reactn';
export async function loadSingleVaultFile(props) {
    setGlobal({loading: true})
    const file = `${props}.json`
    const fileParams = {
        fileName: file,
        decrypt: true
    }

    let thisFile = await fetchData(fileParams);
    setGlobal({
        file: JSON.parse(thisFile), 
        singleFile: JSON.parse(thisFile),
        name: JSON.parse(thisFile).name, 
        type: JSON.parse(thisFile).type,
        loading: false
    })
}