import { decodeCoreCollectionNumMinted } from '@/lib/nft/decodeCoreCollectionNumMinted';
import { Connection, PublicKey } from '@solana/web3.js';

// Separate types for addresses (input) and data (output)
interface AccountAddresses {
  'anchor-vault': string;
  'anchor-escrow': string;
  'pinocchio-vault': string;
}

interface AccountData {
  'anchor-vault': number;
  'anchor-escrow': number;
  'pinocchio-vault': number;
  'total': number;
}

// Type for just the account keys (without total)
type AccountKey = keyof AccountAddresses;

const ACCOUNTS: AccountAddresses = {
  'anchor-vault': "53tiK9zY67DuyA1tgQ6rfNgixMB1LiCP9D67RgfbCrpz",
  'anchor-escrow': "2E5K7FxDWGXkbRpFEAkhR8yQwiUBGggVyng2vaAhah5L",
  'pinocchio-vault': "AL38QM96SDu4Jpx7UGcTcaLtwvWPVgRUzg9PqC787djK",  
}

async function getMultipleAccountData(
  accountAddresses: AccountAddresses
): Promise<AccountData> {
  const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT;

  if (!rpcEndpoint) {
    throw new Error("NEXT_PUBLIC_RPC_ENDPOINT is not set");
  }

  const connection = new Connection(rpcEndpoint, { httpAgent: false });
  
  // Convert addresses to PublicKey objects - use AccountKey instead of keyof AccountData
  const publicKeys = Object.entries(accountAddresses).map(([key, address]) => ({
    key: key as AccountKey,
    publicKey: new PublicKey(address)
  }));

  const result: AccountData = {
    'anchor-escrow': 0,
    'anchor-vault': 0,
    'pinocchio-vault': 0,
    'total': 0,
  };

  try {
    // Fetch all accounts in a single batch request for better performance
    const accountInfos = await connection.getMultipleAccountsInfo(
      publicKeys.map(item => item.publicKey)
    );

    // Process each account
    accountInfos.forEach((accountInfo, index) => {
      const { key } = publicKeys[index];
      
      if (accountInfo) {
        try {
          const collectionSize = decodeCoreCollectionNumMinted(accountInfo.data);
          const size = collectionSize ?? 0;
          result[key] = size;
          result.total += size;
          
          if (collectionSize === null) {
            console.error(`Failed to decode num_minted for ${key}: ${accountAddresses[key]}`);
          }
        } catch (error) {
          console.error(`Failed to decode data for ${key}: ${accountAddresses[key]}`, error);
          result[key] = 0;
        }
      } else {
        console.error(`Failed to fetch account info for ${key}: ${accountAddresses[key]}`);
        result[key] = 0;
      }
    });

  } catch (error) {
    console.error('Failed to fetch multiple account details:', error);
    // Keep default 0 values for all accounts on network error
  }

  return result;
}

export async function GET(_request: Request) { // eslint-disable-line @typescript-eslint/no-unused-vars
  try {
    const data = await getMultipleAccountData(ACCOUNTS);
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log(`Error fetching account data: ${errorMessage}`);
    
    return new Response(
      JSON.stringify({ error: 'Failed to fetch account data' }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}