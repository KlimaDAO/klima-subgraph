// Dynamically import the ipfs-http-client module
async function getIpfsClient() {
  const { create } = await import('ipfs-http-client')
  return create({ host: 'localhost', port: '5001', protocol: 'http' })
}

const localPin = async (filePath) => {
  try {
    const ipfs = await getIpfsClient()
    const fs = await import('fs/promises')
    const file = await fs.readFile(filePath)

    const fileAdded = await ipfs.add(file)
    console.log(`File uploaded successfully. CID: ${fileAdded.cid}`)
    return fileAdded.cid
  } catch (error) {
    console.error(`Error uploading file: ${error}`)
  }
}

module.exports = { localPin }

// Replace '/path/to/your/file' with the actual file path
localPin('carbonmark/src/Projects.ts')
