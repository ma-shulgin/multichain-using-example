import * as ss58 from "@subsquid/ss58";
import { request, gql, GraphQLClient } from "graphql-request";
import * as fs from "fs";

// Specify stitched squid endpoint
const GQL_ENDPOINT = "https://app.devsquid.net/squids/super-api/v2/graphql";
// Specify  account's address in ANY chain or just substrate address (it is shown in polkadot.js extension)
const ANY_ADRESS = "YFbLqqwvegzXpE65mGAPSxe2VQaL2u8ApuDT7KMWTSND8Hk";

// Uncomment 'notexist' chain to see the error message
const chainNames = [
  "kusama",
  "polkadot",
  "moonbeam",
  // 'astar'
  // 'notexist',
];

// Creating multichain Account entity
interface Account {
  addressBase: Uint8Array;
  adresses: Map<string, string>;
}

const account: Account = {
  addressBase: ss58.decode(ANY_ADRESS).bytes,
  adresses: new Map(),
};

// Creating codec for every chain
var chainCodecs: Map<string, ss58.Codec> = new Map();

chainNames.forEach((chainName) => {
  try {
    chainCodecs.set(chainName, ss58.codec(chainName));
  } catch {
    // Uncomment 'notexist' in 'chainNames' definition to see the error message
    console.error(
      `Can't find codec for name ${chainName}. Please specify its prefix manually`
    );
    process.exit(1);
  }
});

// Suppose we can't find astar and we specify its prefix manually
chainCodecs.set("astar", ss58.codec(5));

// Getting account's addresses for every chain
chainCodecs.forEach((codec, chain) => {
  account.adresses.set(chain, codec.encode(account.addressBase));
});

// console.log(account.adresses)

// Query sample for a single chain
// Latest 10 transfers from every chain
function chainTransfersQuery(chainName: string, address: string) {
  return gql`
  ${chainName} {
    accountById(id: "${address}") {
      id
      transfers(limit: 10, orderBy: transfer_blockNumber_DESC) {
        direction
        transfer {
          fromId
          toId
          success
          amount
          timestamp
        }
      }
    }
  }
  `;
}

// Use sample query to every chain
let query = "";
account.adresses.forEach((address, chain) => {
  query += chainTransfersQuery(chain, address);
});

// Wrap final query to gql query syntax
const finalQuery = gql`query AccountTransfersQuery {${query}}`;

// console.log(finalQuery)

// Connect to the endpoint, make ONLY one request and see the result
const graphQLClient = new GraphQLClient(GQL_ENDPOINT);
graphQLClient
  .request(finalQuery)
  .then((res) =>
    fs.writeFileSync("result.json", JSON.stringify(res, null, 2))
  );
