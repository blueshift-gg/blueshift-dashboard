import { challenges } from '@/app/content/challenges/challenges';
import { decodeCoreCollectionNumMinted } from '@/lib/nft/decodeCoreCollectionNumMinted';
import { Connection, PublicKey } from '@solana/web3.js';

interface ChallengeStats {
  [key: string]: number;
}

interface StatsData {
  challenges: ChallengeStats;
  total: number;
}

export async function GET(_request: Request) { // eslint-disable-line @typescript-eslint/no-unused-vars
  try {
    const rpcEndpoint = process.env.NEXT_PUBLIC_MAINNET_RPC_ENDPOINT;
    if (!rpcEndpoint) {
      throw new Error("NEXT_PUBLIC_MAINNET_RPC_ENDPOINT is not set");
    }

    const accountAddresses = challenges.reduce((acc: Record<string, string>, challenge) => {
      if (challenge.collectionMintAddress) {
        acc[challenge.slug] = challenge.collectionMintAddress;
      }
      return acc;
    }, {});

    const connection = new Connection(rpcEndpoint, { httpAgent: false });
    
    const publicKeysWithKeys = Object.entries(accountAddresses).map(([key, address]) => ({
      key,
      publicKey: new PublicKey(address)
    }));

    const accountInfos = await connection.getMultipleAccountsInfo(
      publicKeysWithKeys.map(item => item.publicKey)
    );

    const data = accountInfos.reduce<StatsData>(
      (stats, accountInfo, index) => {
        const { key } = publicKeysWithKeys[index];
        const address = accountAddresses[key];

        let size = 0;
        if (accountInfo) {
          try {
            const collectionSize = decodeCoreCollectionNumMinted(accountInfo.data);
            size = collectionSize ?? 0;
            if (collectionSize === null) {
              console.error(`Failed to decode num_minted for ${key}: ${address}`);
            }
          } catch (error) {
            console.error(`Failed to decode data for ${key}: ${address}`, error);
          }
        } else {
          console.error(`Failed to fetch account info for ${key}: ${address}`);
        }

        stats.challenges[key] = size;
        stats.total += size;
        return stats;
      },
      { challenges: {}, total: 0 }
    );
    
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
