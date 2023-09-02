import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import { readBackupFile, writeEntryFiles } from "./backup.ts";

await new Command()
  .name('pixelblaze')
  .description('A simple CLI to expand and compress Pixelblaze backup (.pbb) files.')
  
  // unpack command
  .command('u unpack', 'unpack sub-command')
  .option('-i, --input <inputFilePath:string>', "Input packed Pixelblaze backup file path", {required: true})
  .option('-o, --output <outputDirectoryPath:string>', "Output directory path to unpack to", {required: true})
  .action(async ({input: inputFilePath, output: outputDirectoryPath}) => {
    console.log(`Unpacking ${inputFilePath} to ${outputDirectoryPath}`);
    const backupFile = await readBackupFile(inputFilePath);
    
    console.log(`Deleting directory "${outputDirectoryPath}"`);
    try {
      await Deno.remove(outputDirectoryPath, { recursive: true });
    } catch (error) {
      console.error(error);
    }
  
    await Deno.mkdir(outputDirectoryPath, {recursive: true});
    
    for (const entry of backupFile.entries) {
      await writeEntryFiles(entry, outputDirectoryPath);
    }
  })

  // // pack command
  // .command('p pack', 'pack sub-command')
  // .option('-i, --input <inputDirectoryPath:string>', "Input unpacked directory path")
  // .option('-o, --output <outputFilePath:string>', "Output Pixelblaze backup file path")
  // .action(options => {
  //   console.log({options});
  // })

  .parse();
