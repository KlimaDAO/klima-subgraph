import { Bytes } from '@graphprotocol/graph-ts'

//Token Addresses
export const BCT_TOKEN: string = 'BCT'
export const BCT_ERC20_CONTRACT: string = '0x2f800db0fdb5223b3c3f354886d907a671414a7f'
export const NCT_TOKEN: string = 'NCT'
export const NCT_ERC20_CONTRACT: string = '0xd838290e877e0188a4a44700463419ed96c16107'
export const MCO2_TOKEN: string = 'MCO2'
export const MCO2_ERC20_CONTRACT: string = '0xaa7dbd1598251f856c12f63557a4c4397c253cea'
export const UBO_TOKEN: string = 'UBO'
export const UBO_ERC20_CONTRACT: string = '0x2b3ecb0991af0498ece9135bcd04013d7993110c'
export const NBO_TOKEN: string = 'NBO'
export const NBO_ERC20_CONTRACT: string = '0x6bca3b77c1909ce1a4ba1a20d1103bde8d222e48'
export const CCO2_TOKEN: string = 'CCO2'
export const CCO2_ERC20_CONTRACT: string = '0x82B37070e43C1BA0EA9e2283285b674eF7f1D4E2'

// Klima Retirement Contracts
export const KLIMA_CARBON_RETIREMENTS_CONTRACT = '0xac298cd34559b9acfaedea8344a977eceff1c0fd'
export const KLIMA_INFINITY_DIAMOND = '0x8cE54d9625371fb2a068986d32C85De8E6e995f8'

//Metrics init timestamp - 10th of Oct 2021 (Day of BCT ERC20 contract creation)
export const METRICS_INIT_TIMESTAMP = '1633824000'

// Event topic0 signatures for certificates

// CertificateMinted(uint256): Toucan RetirementCertificates
export const CERTIFICATE_MINTED_TOPIC0 = Bytes.fromHexString(
  '0x54b249c3cd4a5f80e81d2ad036b251d58d8f5482a926f25d12eabec192cf1ecd'
)

// Retired(address,uint256,uint256): TCO2 1.4.0
export const RETIRED_1_4_0_TOPIC0 = Bytes.fromHexString(
  '0xb3775f672e1adf43bf7834b692675bfee4db72f83e42da8cff694ca295a89eca'
)

// Retired(address,uint256): legacy TCO2
export const RETIRED_LEGACY_TOPIC0 = Bytes.fromHexString(
  '0x8dc4b87efb3c82876c566fb305749c81faf4459424134a0470fee3f604048de7'
)
