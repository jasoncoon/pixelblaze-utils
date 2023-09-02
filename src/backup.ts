import { decode } from "https://deno.land/std@0.200.0/encoding/base64.ts";
import * as path from "https://deno.land/std@0.200.0/path/mod.ts";
import { Pattern, readPattern } from "./pattern.ts";
import { getJson } from "./utils.ts";

export interface BackupFile {
  files: Record<string, string>;
}

export interface Backup {
  entries: Entry[];
}

export interface Entry {
  key: string;
  value: string;
  valueBytes: Uint8Array;
  valueDecoded: string;
  pattern?: Pattern;
}

export async function readBackupFile(filePath: string): Promise<Backup> {
  if (!filePath.endsWith(".pbb")) {
    console.log(`Skipping file without valid .pbb extension: "${filePath}"`);
  }

  const directoryPath = filePath.replace(".pbb", "");

  console.log(`Reading "${filePath}`);
  const backupFile = await getJson<BackupFile>(filePath);

  const backup: Backup = { entries: [] };

  for (const [key, value] of Object.entries(backupFile.files)) {
    if (typeof value !== 'string') {
      console.log(`Skipping file "${key}" with non-string value`);
      continue;
    }

    console.log(`Reading "${directoryPath}${key}`);
    const entry = readEntry(key, value, directoryPath);
    backup.entries.push(entry);
  }

  return backup;
}

function readEntry(
  key: string,
  value: string,
  directoryPath: string
): Entry {
  const valueBytes = decode(value);
  let valueDecoded = new TextDecoder().decode(valueBytes);

  let outputFilePath = path.join(directoryPath, key);

  if ([".json", ".c"].some((e) => key.endsWith(e))) {
    valueDecoded = JSON.stringify(JSON.parse(valueDecoded), null, 2);
  }

  if (key.endsWith(".c")) {
    outputFilePath = outputFilePath + ".json";
  }

  // console.log(`Writing file "${outputFilePath}"`);
  // await Deno.writeTextFile(outputFilePath, valueDecoded);

  const entry: Entry = {
    key,
    value,
    valueBytes,
    valueDecoded,
  };

  if (
    !outputFilePath.includes(".") && // no file extension
    !outputFilePath.endsWith("_defaultplaylist_")
  ) {
    entry.pattern = readPattern(valueBytes);
  }

  return entry;
}

export async function writeEntryFiles(entry: Entry, directoryPath: string) {
  const { key, valueDecoded } = entry;

  let outputFilePath = path.join(directoryPath, key);

  const entryDirectoryPath = path.dirname(outputFilePath);

  await Deno.mkdir(entryDirectoryPath, { recursive: true });

  if (key.endsWith(".c")) {
    outputFilePath = outputFilePath + ".json";
  }

  console.log(`Writing entry file "${outputFilePath}"`);
  await Deno.writeTextFile(outputFilePath, valueDecoded);

  if (entry.pattern) {
    const { name, jpegData, source, sourceObj } = entry.pattern;

    console.log(`Writing pattern name file "${outputFilePath + ".name.text"}"`);
    await Deno.writeTextFile(outputFilePath + ".name.text", name);

    console.log(`Writing pattern image file "${outputFilePath + ".jpg"}"`);
    await Deno.writeFile(outputFilePath + ".jpg", jpegData);

    console.log(`Writing pattern source file "${outputFilePath + ".json"}"`);
    await Deno.writeTextFile(outputFilePath + ".json", source);

    for (const [sourceKey, sourceValue] of Object.entries(sourceObj)) {
      if (typeof sourceValue !== 'string') {
        console.log(`Skipping pattern source code file "${sourceKey}" with non-string value`);
         continue;
      }

      console.log(`Writing pattern source code file "${outputFilePath + "." + sourceKey + ".js"}"`);
      await Deno.writeTextFile(
        outputFilePath + "." + sourceKey + ".js",
        sourceValue
      );
    }
  }
}
