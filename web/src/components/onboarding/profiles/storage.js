export async function checkStorageProvider() {
  let storageProvider = await JSON.parse(localStorage.getItem('storageProvider'))
  return storageProvider;
}
