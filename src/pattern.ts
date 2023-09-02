
import LZString from "npm:lz-string@1.5.0";

export interface Pattern {
  version: number;

  nameOffset: number;
  nameLength: number;
  name: string;

  jpegOffset: number;
  jpegLength: number;
  jpegData: Uint8Array;

  byteCodeOffset: number;
  byteCodeLength: number;
  byteCode: Uint8Array;

  sourceOffset: number;
  sourceLength: number;
  source: string;
  sourceObj: Record<string, string>;

  controls?: Record<string, number | boolean>;
}

export function readPattern(valueBytes: Uint8Array): Pattern {
  /*
    The first 9 DWORDs of the binaryData is a header containing offsets to the components:
      0=version, 
      1=nameOffset, 2=nameLength, 
      3=jpegOffset, 4=jpegLength,
      5=bytecodeOffset, 6=bytecodeLength,
      7=sourceOffset, 8=sourceLength
  */

  const dataView = new DataView(valueBytes.buffer);

  let offset = 0;

  const version = dataView.getUint32(offset, true);

  const nameOffset = dataView.getUint32((offset += 4), true);
  const nameLength = dataView.getUint32((offset += 4), true);

  const jpegOffset = dataView.getUint32((offset += 4), true);
  const jpegLength = dataView.getUint32((offset += 4), true);

  const byteCodeOffset = dataView.getUint32((offset += 4), true);
  const byteCodeLength = dataView.getUint32((offset += 4), true);

  const sourceOffset = dataView.getUint32((offset += 4), true);
  const sourceLength = dataView.getUint32((offset += 4), true);

  const name = new TextDecoder().decode(
    valueBytes.slice(nameOffset, nameOffset + nameLength)
  );

  const jpegData = valueBytes.slice(jpegOffset, jpegOffset + jpegLength);

  const byteCode = valueBytes.slice(
    byteCodeOffset,
    byteCodeOffset + byteCodeLength
  );

  const source = LZString.decompressFromUint8Array(
    valueBytes.slice(sourceOffset, sourceOffset + sourceLength)
  );

  const sourceObj = JSON.parse(source);

  return {
    version,
    nameOffset,
    nameLength,
    name,
    jpegOffset,
    jpegLength,
    jpegData,
    byteCodeOffset,
    byteCodeLength,
    byteCode,
    sourceOffset,
    sourceLength,
    source,
    sourceObj,
  };
}
