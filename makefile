#!make
include .env
export $(shell sed 's/=.*//' .env)

.PHONY: local-fork

PURO_TOKEN = 0x6960cE1d21f63C4971324B5b611c4De29aCF980C

PURO_TOKEN_HOLDER = 0x89DCA1d490aa6e4e7404dC7a55408519858895FE

OTHER_HOLDER=0xE32bb999851587b53d170C0A130cCE7f542c754d

USDC = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174

KRAKEN = 0x9c2bd617b77961ee2c5e3038dFb0c822cb75d82a


DIAMOND = 0x8cE54d9625371fb2a068986d32C85De8E6e995f8

# klima testing profile
DUMMY_SERVER_WALLET = 0xb5B74972D2011070034005E25e1E264e551A611a

DIAMOND_OWNER = 0xDdfF75A29EB4BFEcF65380de9a75ad08C140eA49

ANVIL_PUBLIC_WALLET = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

TCO2 = 0xb139c4cc9d20a3618e9a2268d73eff18c496b991

TCO2_HOLDER = 0x34798dd650DD478a801Fc1b0125cD6848F52F693

MARKETPLACE = 0x7B51dBc2A8fD98Fe0924416E628D5755f57eB821

CMARK_TOKEN_FACTORY = 0xEeE3abDD638E219261e061c06C0798Fd5C05B5D3 

CMARK_TOKEN_FACTORY_OWNER = 0xc51Cc27d3BB611DB27f26F617E1c15483A8790Cf 

BENEFICIARY = 0xdc1DfA8C0b6C4a8BB22400608468aCfF21016Fad

export RPC_URL = http://localhost:8545

local-fork:
	anvil --fork-url $(POLYGON_URL) --host 0.0.0.0 --no-storage-caching

local-fork-block:
	anvil --fork-url $(POLYGON_URL) --fork-block-number ${FORK_BLOCK} --host 0.0.0.0 --no-storage-caching


impersonate:
	cast rpc anvil_impersonateAccount ${PURO_TOKEN_HOLDER} --rpc-url ${RPC_URL}

	cast rpc anvil_impersonateAccount ${OTHER_HOLDER} --rpc-url ${RPC_URL}
	
	# impersonate kraken for USDC transfers
	cast rpc anvil_impersonateAccount ${KRAKEN} --rpc-url ${RPC_URL}

	cast rpc anvil_impersonateAccount ${ANVIL_PUBLIC_WALLET} --rpc-url ${RPC_URL}

	cast rpc anvil_impersonateAccount ${DIAMOND_OWNER} --rpc-url ${RPC_URL}

	cast rpc anvil_impersonateAccount ${DUMMY_SERVER_WALLET} --rpc-url ${RPC_URL}

	# BCT holder
	cast rpc anvil_impersonateAccount ${TCO2_HOLDER} --rpc-url ${RPC_URL}

	# impersonate server wallets

	cast rpc anvil_impersonateAccount 0xfb079f82cdd18313f3566fb8ddd6414b3507bda2 --rpc-url ${RPC_URL}

	cast rpc anvil_impersonateAccount 0x885d78bc6d5cab15e7ef10963846bd2f975c2b89 --rpc-url ${RPC_URL}

	# Impersonate CarbonmarkCreditTokenFactory owner
	cast rpc anvil_impersonateAccount ${CMARK_TOKEN_FACTORY_OWNER} --rpc-url ${RPC_URL}



tco2:

	# fund with TCO2 for other erc20 testing

	cast send ${TCO2} --unlocked --from ${TCO2_HOLDER} "approve(address,uint256)(bool)" ${DIAMOND} 405000000000000000000 --rpc-url ${RPC_URL}

	cast send ${TCO2} --unlocked --from ${TCO2_HOLDER} "transfer(address,uint256)(bool)" ${ANVIL_PUBLIC_WALLET} 405000000000000000000 --rpc-url ${RPC_URL}



transfer:
	cast send 0x6960cE1d21f63C4971324B5b611c4De29aCF980C --unlocked --from ${PURO_TOKEN_HOLDER} "transfer(address,uint256)(bool)" ${ANVIL_PUBLIC_WALLET} 3000000000000000000 --rpc-url ${RPC_URL}

	cast send 0x6960cE1d21f63C4971324B5b611c4De29aCF980C --unlocked --from ${OTHER_HOLDER} "transfer(address,uint256)(bool)" ${ANVIL_PUBLIC_WALLET} 2000000000000000000 --rpc-url ${RPC_URL}

	cast send ${USDC} --unlocked --from ${KRAKEN} "transfer(address,uint256)(bool)" ${ANVIL_PUBLIC_WALLET} 500000000000 --rpc-url ${RPC_URL}

	# fund fake server wallets

	cast send ${USDC} --unlocked --from ${DUMMY_SERVER_WALLET} "approve(address,uint256)(bool)" ${DIAMOND} 500000000000 --rpc-url ${RPC_URL}

	cast send ${USDC} --unlocked --from ${KRAKEN} "transfer(address,uint256)(bool)" ${DUMMY_SERVER_WALLET} 500000000000 --rpc-url ${RPC_URL}

	# fund server wallets, production and otherwise

	cast send ${USDC} --unlocked --from 0xfb079f82cdd18313f3566fb8ddd6414b3507bda2 "approve(address,uint256)(bool)" ${DIAMOND} 500000000000 --rpc-url ${RPC_URL}

	cast send ${USDC} --unlocked --from 0x885d78bc6d5cab15e7ef10963846bd2f975c2b89 "approve(address,uint256)(bool)" ${DIAMOND} 500000000000 --rpc-url ${RPC_URL}


	# fund with TCO2 for other erc20 testing

	cast send ${TCO2} --unlocked --from ${TCO2_HOLDER} "approve(address,uint256)(bool)" ${DIAMOND} 8224922846527844 --rpc-url ${RPC_URL}

	cast send ${TCO2} --unlocked --from ${TCO2_HOLDER} "transfer(address,uint256)(bool)" ${ANVIL_PUBLIC_WALLET} 8224922846527844 --rpc-url ${RPC_URL}

create_listing:

	cast send ${PURO_TOKEN} --unlocked --from ${ANVIL_PUBLIC_WALLET} "approve(address,uint256)(bool)" ${MARKETPLACE} 5000000000000000000 --rpc-url ${RPC_URL}

	cast send ${MARKETPLACE} --unlocked --from ${ANVIL_PUBLIC_WALLET} "createListing(address,uint256,uint256,uint256,uint256)(bool)" ${PURO_TOKEN} 5000000000000000000 2500000 10000000000000000 1748548281 --rpc-url ${RPC_URL}
		
approve:

	# cast send ${USDC} --unlocked --from ${ANVIL_PUBLIC_WALLET} "approve(address,uint256)(bool)" ${DIAMOND} 500000000000 --rpc-url ${RPC_URL}

	cast send ${USDC} --unlocked --from ${DUMMY_SERVER_WALLET} "approve(address,uint256)(bool)" ${DIAMOND} 5000000000000 --rpc-url ${RPC_URL}

	# fund server wallets, production and otherwise

	# prod
	cast send ${USDC} --unlocked --from 0x885d78bc6d5cab15e7ef10963846bd2f975c2b89 "approve(address,uint256)(bool)" ${DIAMOND} 500000000000 --rpc-url ${RPC_URL}
	
	# test
	cast send ${USDC} --unlocked --from 0xfb079f82cdd18313f3566fb8ddd6414b3507bda2 "approve(address,uint256)(bool)" ${DIAMOND} 500000000000 --rpc-url ${RPC_URL}


usdc_transfer:

	cast send ${USDC} --unlocked --from ${KRAKEN} "transfer(address,uint256)(bool)" ${ANVIL_PUBLIC_WALLET} 500000000000
	
	cast send ${USDC} --unlocked --from ${KRAKEN} "transfer(address,uint256)(bool)" ${DUMMY_SERVER_WALLET} 500000000000
	

balances:
	cast call 0x6960cE1d21f63C4971324B5b611c4De29aCF980C "balanceOf(address)(uint256)" ${ANVIL_PUBLIC_WALLET}

	cast call ${TCO2} "balanceOf(address)(uint256)" ${TCO2_HOLDER}

	cast call ${TCO2} "balanceOf(address)(uint256)" ${ANVIL_PUBLIC_WALLET}

	cast call ${TCO2} "balanceOf(address)(uint256)" ${ANVIL_PUBLIC_WALLET}

approvals:

	# cast call ${USDC} "allowance(address,address)(uint256)" ${DUMMY_SERVER_WALLET} ${DIAMOND}

	cast call ${USDC} "allowance(address,address)(uint256)" ${ANVIL_PUBLIC_WALLET} ${DIAMOND}

	# cast call ${USDC} "allowance(address,address)(uint256)" 0xfb079f82cdd18313f3566fb8ddd6414b3507bda2 ${DIAMOND}

	# cast call ${USDC} "allowance(address,address)(uint256)" 0x885d78bc6d5cab15e7ef10963846bd2f975c2b89 ${DIAMOND}	


cmark-issue:
	cast send ${CMARK_TOKEN_FACTORY} --unlocked --from ${CMARK_TOKEN_FACTORY_OWNER} "issueCredits(string,uint256,address)()" CMARK-1000-2025 1000000000000 ${ANVIL_PUBLIC_WALLET} --rpc-url ${RPC_URL}

cmark-cancel:
	cast send ${CMARK_TOKEN_FACTORY} --unlocked --from ${CMARK_TOKEN_FACTORY_OWNER} "cancelCredits(string,uint256,string,address)()" CMARK-1000-2025 500000000000 bad ${ANVIL_PUBLIC_WALLET} --rpc-url ${RPC_URL}

cmark-get-addr:
	$(eval CMARK_TOKEN = $(shell cast call ${CMARK_TOKEN_FACTORY} "creditIdToAddress(string)(address)" CMARK-1000-2025 --rpc-url ${RPC_URL}))

cmark-balance: cmark-get-addr
	cast call ${CMARK_TOKEN} "balanceOf(address)(uint256)" ${ANVIL_PUBLIC_WALLET} --rpc-url ${RPC_URL}

cmark-retire: cmark-get-addr
	cast send ${CMARK_TOKEN} --unlocked --from ${ANVIL_PUBLIC_WALLET} "approve(address,uint256)(uint256)" ${DUMMY_SERVER_WALLET} 10000000000000000000000 --rpc-url ${RPC_URL}
	cast send ${CMARK_TOKEN} --unlocked --from ${DUMMY_SERVER_WALLET} "retireFrom(uint256,address,string,string,string,address)()" 2500000000 ${BENEFICIARY} "beneficiary" "message" "US" ${ANVIL_PUBLIC_WALLET} --rpc-url ${RPC_URL}


cmark: cmark-issue
