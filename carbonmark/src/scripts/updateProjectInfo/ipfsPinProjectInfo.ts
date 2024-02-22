import fs from 'fs'
import pinataSDK, { PinataPinResponse } from '@pinata/sdk'
import dotenv from 'dotenv'
dotenv.config()

export const ipfsPinProjectInfo = async (): Promise<PinataPinResponse> => {
  const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT })
  try {
    const file = fs.createReadStream('carbonmark/src/CorrectedProjectsIPFS.json')

    const res = await pinata.pinFileToIPFS(file, { pinataMetadata: { name: 'PROJECT_INFO' } })


    return res
  } catch (error) {
    return error
  }
}
