.PHONY: local-fork

PURO_TOKEN = 0x6960cE1d21f63C4971324B5b611c4De29aCF980C

PURO_175613=0x9bbC1563Fa8A2267EE0c846C591208160afb0B34

PURO_TOKEN_HOLDER = 0x89DCA1d490aa6e4e7404dC7a55408519858895FE

ECO_114=0xa8853ffc5a0aeab7d31631a4b87cb12c0b289c6c

ECO_114_HOLDER=0x91eAAB967A195d7B968269ca9d7282bdcE65179A

OTHER_HOLDER=0xE32bb999851587b53d170C0A130cCE7f542c754d

USDC = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174

KRAKEN = 0x9c2bd617b77961ee2c5e3038dFb0c822cb75d82a

DIAMOND = 0x8cE54d9625371fb2a068986d32C85De8E6e995f8

DIAMOND_OWNER = 0xDdfF75A29EB4BFEcF65380de9a75ad08C140eA49

# klima testing profile
DUMMY_SERVER_WALLET = 0xb5B74972D2011070034005E25e1E264e551A611a

ANVIL_PUBLIC_WALLET = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

TCO2 = 0xb139c4cc9d20a3618e9a2268d73eff18c496b991

TCO2_HOLDER = 0x34798dd650DD478a801Fc1b0125cD6848F52F693

MARKETPLACE = 0x7B51dBc2A8fD98Fe0924416E628D5755f57eB821

MERCHANT_WALLET=0x7619b8747AE3d1Bc31a758C5EFFCb86D4C3a1653

TOUCAN_ADMIN=0xCDe1E9f9c7DCAd2242BD85d158A00181aA89B36b


MERCHANT_WALLET=0x7619b8747AE3d1Bc31a758C5EFFCb86D4C3a1653

TOUCAN_ADMIN=0xCDe1E9f9c7DCAd2242BD85d158A00181aA89B36b

CCO2=0x82B37070e43C1BA0EA9e2283285b674eF7f1D4E2

CCO2_HOLDER=0xCFb1189c0b3b3f376B7226d78Ed1a08467810c4B


local-fork:
	$(eval POLYGON_URL := $(shell grep '^POLYGON_URL' .env | cut -d '=' -f2))
	anvil --fork-url $(POLYGON_URL) --host 0.0.0.0 --no-storage-caching

local-fork-block:
	$(eval POLYGON_URL := $(shell grep '^POLYGON_URL' .env | cut -d '=' -f2))
	anvil --fork-url $(POLYGON_URL) --fork-block-number 60542813 --host 0.0.0.0 --no-storage-caching


impersonate:
	@echo "Using RPC_URL: ${RPC_URL}"
	$(eval RPC_URL := $(shell grep '^RPC_URL' .env | cut -d '=' -f2))
	cast rpc anvil_impersonateAccount ${PURO_TOKEN_HOLDER} --rpc-url ${RPC_URL}

	cast rpc anvil_impersonateAccount ${OTHER_HOLDER} --rpc-url ${RPC_URL}
	
	# impersonate kraken for USDC transfers
	cast rpc anvil_impersonateAccount ${KRAKEN} --rpc-url ${RPC_URL}

	cast rpc anvil_impersonateAccount ${ANVIL_PUBLIC_WALLET} --rpc-url ${RPC_URL}

	cast rpc anvil_impersonateAccount ${DUMMY_SERVER_WALLET} --rpc-url ${RPC_URL}

	# BCT holder
	cast rpc anvil_impersonateAccount ${TCO2_HOLDER} --rpc-url ${RPC_URL}

	# CCO2 holder
	cast rpc anvil_impersonateAccount ${CCO2_HOLDER} --rpc-url ${RPC_URL}

	# impersonate server wallets

	cast rpc anvil_impersonateAccount 0xfb079f82cdd18313f3566fb8ddd6414b3507bda2 --rpc-url ${RPC_URL}

	cast rpc anvil_impersonateAccount 0x885d78bc6d5cab15e7ef10963846bd2f975c2b89 --rpc-url ${RPC_URL}

	cast rpc anvil_impersonateAccount ${ECO_114_HOLDER} --rpc-url ${RPC_URL}

	# impersonate diamond owner
	cast rpc anvil_impersonateAccount ${DIAMOND_OWNER} --rpc-url ${RPC_URL}

	# CM wallet with PURO_TOKEN

	cast rpc anvil_impersonateAccount ${MERCHANT_WALLET} --rpc-url ${RPC_URL}

	cast rpc anvil_impersonateAccount ${TOUCAN_ADMIN} --rpc-url ${RPC_URL}

	cast send ${TOUCAN_ADMIN} --unlocked --from ${ANVIL_PUBLIC_WALLET} --value 1000000000000000000 --rpc-url ${RPC_URL}
	

tco2:

	# fund with TCO2 for other erc20 testing

	cast send ${TCO2} --unlocked --from ${TCO2_HOLDER} "approve(address,uint256)(bool)" ${INFINITY} 405000000000000000000 --rpc-url http://localhost:8545

	cast send ${TCO2} --unlocked --from ${TCO2_HOLDER} "transfer(address,uint256)(bool)" ${ANVIL_PUBLIC_WALLET} 405000000000000000000 --rpc-url ${RPC_URL}

cco2:

	# fund with CCO2 for other erc20 testing

	cast send ${CCO2} --unlocked --from ${CCO2_HOLDER} "approve(address,uint256)(bool)" ${DIAMOND} 405000000000000000000 --rpc-url ${RPC_URL}

	cast send ${CCO2} --unlocked --from ${CCO2_HOLDER} "transfer(address,uint256)(bool)" ${ANVIL_PUBLIC_WALLET} 405000000000000000000 --rpc-url ${RPC_URL}

transfer:
	$(eval RPC_URL := $(shell grep '^RPC_URL' .env | cut -d '=' -f2))
	cast send 0x6960cE1d21f63C4971324B5b611c4De29aCF980C --unlocked --from ${PURO_TOKEN_HOLDER} "transfer(address,uint256)(bool)" ${ANVIL_PUBLIC_WALLET} 3000000000000000000 --rpc-url ${RPC_URL}

	cast send 0x6960cE1d21f63C4971324B5b611c4De29aCF980C --unlocked --from ${OTHER_HOLDER} "transfer(address,uint256)(bool)" ${ANVIL_PUBLIC_WALLET} 2000000000000000000 --rpc-url ${RPC_URL}

	cast send ${USDC} --unlocked --from ${KRAKEN} "transfer(address,uint256)(bool)" ${ANVIL_PUBLIC_WALLET} 500000000000 --rpc-url ${RPC_URL}

	# fund fake server wallets

	cast send ${USDC} --unlocked --from ${DUMMY_SERVER_WALLET} "approve(address,uint256)(bool)" ${INFINITY} 500000000000 --rpc-url http://localhost:8545

	cast send ${USDC} --unlocked --from ${KRAKEN} "transfer(address,uint256)(bool)" ${DUMMY_SERVER_WALLET} 500000000000 --rpc-url ${RPC_URL}

	# fund server wallets, production and otherwise

	cast send ${USDC} --unlocked --from 0xfb079f82cdd18313f3566fb8ddd6414b3507bda2 "approve(address,uint256)(bool)" ${INFINITY} 500000000000 --rpc-url http://localhost:8545

	cast send ${USDC} --unlocked --from 0x885d78bc6d5cab15e7ef10963846bd2f975c2b89 "approve(address,uint256)(bool)" ${INFINITY} 500000000000 --rpc-url http://localhost:8545


	# fund with TCO2 for other erc20 testing

	cast send ${TCO2} --unlocked --from ${TCO2_HOLDER} "approve(address,uint256)(bool)" ${INFINITY} 8224922846527844 --rpc-url http://localhost:8545

	cast send ${TCO2} --unlocked --from ${TCO2_HOLDER} "transfer(address,uint256)(bool)" ${ANVIL_PUBLIC_WALLET} 8224922846527844 --rpc-url ${RPC_URL}

	# fund with puro from merchant wallet

	cast send ${PURO_175613} --unlocked --from ${MERCHANT_WALLET} "approve(address,uint256)(bool)" ${INFINITY} 5000000000000000000 --rpc-url http://localhost:8545

	cast send ${PURO_175613} --unlocked --from ${MERCHANT_WALLET} "transfer(address,uint256)(bool)" ${ANVIL_PUBLIC_WALLET} 5000000000000000000 --rpc-url http://localhost:8545

	cast send ${MARKETPLACE} --unlocked --from ${ANVIL_PUBLIC_WALLET} "createListing(address,uint256,uint256,uint256,uint256)(bool)" ${PURO_TOKEN} 5000000000000000000 2500000 10000000000000000 1748548281 --rpc-url ${RPC_URL}

	# fund with puro from merchant wallet

	cast send ${PURO_175613} --unlocked --from ${MERCHANT_WALLET} "approve(address,uint256)(bool)" ${DIAMOND} 5000000000000000000 --rpc-url http://localhost:8545

	cast send ${PURO_175613} --unlocked --from ${MERCHANT_WALLET} "transfer(address,uint256)(bool)" ${ANVIL_PUBLIC_WALLET} 5000000000000000000 --rpc-url http://localhost:8545
		
approve:

	# cast send ${USDC} --unlocked --from ${ANVIL_PUBLIC_WALLET} "approve(address,uint256)(bool)" ${INFINITY} 500000000000 --rpc-url http://localhost:8545

	cast send ${USDC} --unlocked --from ${DUMMY_SERVER_WALLET} "approve(address,uint256)(bool)" ${INFINITY} 5000000000000 --rpc-url http://localhost:8545

	# fund server wallets, production and otherwise

	# prod
	cast send ${USDC} --unlocked --from 0x885d78bc6d5cab15e7ef10963846bd2f975c2b89 "approve(address,uint256)(bool)" ${INFINITY} 500000000000 --rpc-url http://localhost:8545	
	
	# test
	cast send ${USDC} --unlocked --from 0xfb079f82cdd18313f3566fb8ddd6414b3507bda2 "approve(address,uint256)(bool)" ${INFINITY} 500000000000 --rpc-url http://localhost:8545

usdc_transfer:

	cast send ${USDC} --unlocked --from ${KRAKEN} "transfer(address,uint256)(bool)" ${ANVIL_PUBLIC_WALLET} 500000000000
	
	cast send ${USDC} --unlocked --from ${KRAKEN} "transfer(address,uint256)(bool)" ${DUMMY_SERVER_WALLET} 500000000000

eco_transfer:

	cast send ${ECO_114} --unlocked --from ${ECO_114_HOLDER} "transfer(address,uint256)(bool)" ${ANVIL_PUBLIC_WALLET} 1000000000000000000

# listings
create_puro_listing:

	cast send ${PURO_TOKEN} --unlocked --from ${ANVIL_PUBLIC_WALLET} "approve(address,uint256)(bool)" ${MARKETPLACE} 5000000000000000000 --rpc-url http://localhost:8545

	cast send ${MARKETPLACE} --unlocked --from ${ANVIL_PUBLIC_WALLET} "createListing(address,uint256,uint256,uint256,uint256)(bool)" ${PURO_TOKEN} 5000000000000000000 2500000 10000000000000000 1748548281

create_puro_listing_175613:

	cast send ${PURO_175613} --unlocked --from ${ANVIL_PUBLIC_WALLET} "approve(address,uint256)(bool)" ${MARKETPLACE} 5000000000000000000 --rpc-url http://localhost:8545

	cast send ${MARKETPLACE} --unlocked --from ${ANVIL_PUBLIC_WALLET} "createListing(address,uint256,uint256,uint256,uint256)(bool)" ${PURO_175613} 5000000000000000000 2500000 10000000000000000 1748548281

create_puro_listing_one:

	cast send ${PURO_TOKEN} --unlocked --from ${ANVIL_PUBLIC_WALLET} "approve(address,uint256)(bool)" ${MARKETPLACE} 1000000000000000000 --rpc-url http://localhost:8545

	cast send ${MARKETPLACE} --unlocked --from ${ANVIL_PUBLIC_WALLET} "createListing(address,uint256,uint256,uint256,uint256)(bool)" ${PURO_TOKEN} 1000000000000000000 2500000 10000000000000000 1748548281

create_eco_listing:

	cast send ${ECO_114} --unlocked --from ${ANVIL_PUBLIC_WALLET} "approve(address,uint256)(bool)" ${MARKETPLACE} 1000000000000000000 --rpc-url http://localhost:8545

	cast send ${MARKETPLACE} --unlocked --from ${ANVIL_PUBLIC_WALLET} "createListing(address,uint256,uint256,uint256,uint256)(bool)" ${ECO_114} 1000000000000000000 2500000 10000000000000000 1748548281
		
# puro retirements
retire_puro_one:

	cast send ${PURO_TOKEN} --unlocked --from ${ANVIL_PUBLIC_WALLET} "approve(address,uint256)(bool)" ${DIAMOND} 1000000000000000000

	cast send ${DIAMOND} --unlocked --from ${ANVIL_PUBLIC_WALLET} "toucanRetireExactPuroTCO2(address,uint256,uint256,(address,string,address,string,string,string,string,uint256,uint256),uint8)(uint256)" ${PURO_TOKEN} 1713 1000000000000000000 "(${ANVIL_PUBLIC_WALLET},'',${OTHER_HOLDER},'test','test_msg','Canada','CA',1720812615,1720912615)" 0

retire_puro_five:

	cast send ${PURO_TOKEN} --unlocked --from ${ANVIL_PUBLIC_WALLET} "approve(address,uint256)(bool)" ${DIAMOND} 5000000000000000000

	cast send ${DIAMOND} --unlocked --from ${ANVIL_PUBLIC_WALLET} "toucanRetireExactPuroTCO2(address,uint256,uint256,(address,string,address,string,string,string,string,uint256,uint256),uint8)(uint256)" ${PURO_TOKEN} 1713 5000000000000000000 "(${ANVIL_PUBLIC_WALLET},'',${OTHER_HOLDER},'test','test_msg','Canada','CA',1720812615,1720912615)" 0

retire_puro_five_175613:

	cast send ${PURO_175613} --unlocked --from ${ANVIL_PUBLIC_WALLET} "approve(address,uint256)(bool)" ${DIAMOND} 5000000000000000000

	cast send ${DIAMOND} --unlocked --from ${ANVIL_PUBLIC_WALLET} "toucanRetireExactPuroTCO2(address,uint256,uint256,(address,string,address,string,string,string,string,uint256,uint256),uint8)(uint256)" ${PURO_175613} 1716 5000000000000000000 "(${ANVIL_PUBLIC_WALLET},'',${OTHER_HOLDER},'test','test_msg','Canada','CA',1720812615,1720912615)" 0

# utils
approvals:

	# cast call ${USDC} "allowance(address,address)(uint256)" ${DUMMY_SERVER_WALLET} ${DIAMOND}

	cast call ${USDC} "allowance(address,address)(uint256)" ${ANVIL_PUBLIC_WALLET} ${DIAMOND}

	# cast call ${USDC} "allowance(address,address)(uint256)" 0xfb079f82cdd18313f3566fb8ddd6414b3507bda2 ${DIAMOND}

	# cast call ${USDC} "allowance(address,address)(uint256)" 0x885d78bc6d5cab15e7ef10963846bd2f975c2b89 ${DIAMOND}

balances:
	cast call ${PURO_TOKEN} "balanceOf(address)(uint256)" ${ANVIL_PUBLIC_WALLET}

	cast call ${TCO2} "balanceOf(address)(uint256)" ${TCO2_HOLDER}

	cast call ${TCO2} "balanceOf(address)(uint256)" ${ANVIL_PUBLIC_WALLET}

	cast call ${CCO2} "balanceOf(address)(uint256)" ${CCO2_HOLDER}

	cast call ${CCO2} "balanceOf(address)(uint256)" ${ANVIL_PUBLIC_WALLET}

cco2_quote:

	cast call ${DIAMOND} "getSourceAmountSpecificRetirement(address,address,uint256)(uint256)" ${USDC} ${CCO2} 1000000000000000000 --rpc-url ${RPC_URL}

cco2_klima_retire:

	cast send ${USDC} --unlocked --from ${ANVIL_PUBLIC_WALLET} "approve(address,uint256)(bool)" ${DIAMOND} 12603 --rpc-url ${RPC_URL}

	cast send ${DIAMOND} --unlocked --from ${ANVIL_PUBLIC_WALLET} "retireExactCarbonSpecific(address,address,address,uint256,uint256,string,address,string,string,uint8)" ${USDC} ${CCO2} ${CCO2} 12603 1000000000000000000 "Test Entity" ${ANVIL_PUBLIC_WALLET} "Beneficiary Name" "Retirement Message" 0 --rpc-url ${RPC_URL}





	
