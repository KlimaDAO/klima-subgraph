import fs from 'fs'
import pinataSDK from '@pinata/sdk'
import dotenv from 'dotenv'
dotenv.config()

export const ipfsPinProjectInfo = async () => {
  const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT })
  try {
    const file = fs.createReadStream('carbonmark/src/Projects.ts')

    const res = await pinata.pinFileToIPFS(file, { pinataMetadata: { name: 'PROJECT_INFO' } })
    console.log(res)
  } catch (error) {
    console.log(error)
  }
}

ipfsPinProjectInfo()
