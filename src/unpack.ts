import { readBackupFile, writeEntryFiles } from "./backup.ts";

export async function unpack(inputFilePath: string, outputDirectoryPath: string) {
  console.log(`Unpacking ${inputFilePath} to ${outputDirectoryPath}`);
    const backupFile = await readBackupFile(inputFilePath);
    
    console.log(`Deleting directory "${outputDirectoryPath}"`);
    try {
      await Deno.remove(outputDirectoryPath, { recursive: true });
    } catch (error) {
      console.error(error);
    }
  
    await Deno.mkdir(outputDirectoryPath, {recursive: true});
    
    // await Deno.writeTextFile(outputDirectoryPath + "/backup.json", JSON.stringify(backupFile, null, 2));

    for (const entry of backupFile.entries) {
      await writeEntryFiles(entry, outputDirectoryPath);
    }
}