/**
 * Decode the num_minted field from a Core Collection account.
 * 
 * Reference: See BaseCollectionV1 in https://github.com/metaplex-foundation/mpl-core/blob/a1460e5d5f5b45ee355dcb09194eac08f00553ba/clients/rust/src/hooked/mod.rs#L109 
 * @param data 
 * @returns 
 */
export function decodeCoreCollectionNumMinted(data: Buffer): number | null {
  try {
    // Skip over the key (1 byte) and update authority (32 bytes)
    let offset = 33;
    
    // Name String (4 bytes for length + N bytes for string)
    if (data.length < offset + 4) {
      console.error("Account data too short to read name length.");
      return null;
    }
    const nameLength = data.readUInt32LE(offset);
    offset += 4;

    if (data.length < offset + nameLength) {
      console.error("Account data too short to read name string.");
      return null;
    }
    offset += nameLength;

    // URI String (4 bytes for length + M bytes for string)
    if (data.length < offset + 4) {
      console.error("Account data too short to read URI length.");
      return null;
    }
    const uriLength = data.readUInt32LE(offset);
    offset += 4;

    if (data.length < offset + uriLength) {
      console.error("Account data too short to read URI string.");
      return null;
    }
    offset += uriLength;

    // num_minted (u32, 4 bytes)
    if (data.length < offset + 4) {
      console.error("Account data too short to read num_minted.");
      return null;
    }
    const numMinted = data.readUInt32LE(offset);
    return numMinted;

  } catch (error) {
    console.error("Error decoding Core Collection num_minted:", error);
    return null;
  }
} 