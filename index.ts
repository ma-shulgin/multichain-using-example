import * as ss58 from "@subsquid/ss58"
import { request, gql, GraphQLClient } from 'graphql-request';

//subsrate or any chain address


const chainNames = [
    'kusama',
    'polkadot',
    'karura',
    // 'acala'
    // 'notexist',
    // 'anothernotexist'
]

interface Account {
    addressBase: Uint8Array
    adresses : Map<string,any>
    transfers?: Array<any>
}


const account : Account = {
    addressBase : ss58.decode("5F1HeVwsZ4Lxwvey9SX1bgDUpnnQyBx2Uep1pGDBT1otCZtE").bytes,
    adresses : new Map()
}


chainNames.forEach((chainName) => {
    try {
            account.adresses.set(chainName, ss58.codec(chainName).prefix)
    
    } catch {
        console.error(`Can't find prefix for name ${chainName}. Please specify it manually`)
        process.exit(1)
    }
})

account.adresses.set('acala',10)

console.log(account.adresses)

let sub = "polkadot"

var query = gql`
  ${sub} {
    accounts(limit: 1) {
      transfers(limit: 10, orderBy: transfer_blockNumber_DESC) {
        direction
        transfer {
          success
          amount
          blockNumber
        }
      }
    }
  }
`
sub = "kusama"

query += gql`
  ${sub} {
    accounts(limit: 1) {
      transfers(limit: 10, orderBy: transfer_blockNumber_DESC) {
        direction
        transfer {
          success
          amount
          blockNumber
        }
      }
    }
  }
`

const fullQuery = gql`query MyQuery {${query}}`

console.log(fullQuery)

const graphQLClient = new GraphQLClient('https://app.devsquid.net/squids/super-api/v2/graphql')

graphQLClient.request(query).then((res)=>console.dir(res))



