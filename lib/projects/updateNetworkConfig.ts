import { getNetworkConfig } from './utils/getNetworkConfig'
import arg from 'arg';
import fs from 'fs/promises';


(async () => {
    // Parse arguments
    const args = arg({
    });
    const configFile = args["_"][0]

    try {
      const config = JSON.parse(await fs.readFile(configFile, 'utf8'))
  
      const { provider } = getNetworkConfig('polygon');

      // Fetch deployment block
      const startBlock = await provider.getBlockNumber();
      
      // Update config
      config['CreditManager']['startBlock'] = startBlock.toString();
      
      // Write updated config back to file
      await fs.writeFile(configFile, JSON.stringify(config, null, 2));
      
      console.log(`Updated CreditManager start block to ${startBlock}`);
    } catch (error) {
      console.error('Error updating start block:', error);
      process.exit(1);
    }
  })();




