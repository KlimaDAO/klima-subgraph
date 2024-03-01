import fs from 'fs'
import dotenv from 'dotenv'
import FormData from 'form-data'
import axios from 'axios'
dotenv.config()

export const ipfsPinProjectInfo = async (): Promise<string> => {
  try {
    const formData = new FormData()

    formData.append('file', fs.createReadStream('src/CorrectedProjectsIPFS.json'))
    // this pins directly to the ipfs graph node so it's available on the hosted service
    try {
      const pinResponse = await axios.post(`https://api.thegraph.com/ipfs/api/v0/add`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 10000,
      })

      console.log('file successfully pinned to ipfs node', pinResponse.data)
      return pinResponse.data.Hash
    } catch (error) {
      if (error.response) {
        console.log('Error Response:', error.response.data)
        console.log('Status:', error.response.status)
        console.log('Headers:', error.response.headers)
      } else if (error.request) {
        console.log('Error Request:', error.request)
      } else {
        console.log('Error Message:', error.message)
      }
      console.log('Config:', error.config)
      return error
    }
  } catch (error) {
    return error
  }
};
