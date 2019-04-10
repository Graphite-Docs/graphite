import { fetchData } from '../../shared/helpers/fetch';
import { setGlobal } from 'reactn';
export async function loadSingleVaultFile(props) {
    console.log(props);
    const file = `${props}.json`
    const fileParams = {
        fileName: file,
        decrypt: true
    }

    let thisFile = await fetchData(fileParams);
    setGlobal({
        file: JSON.parse(thisFile)
    })
}