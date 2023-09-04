import {
  Command,
  CompletionsCommand,
  HelpCommand,
  ValidationError,
} from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import {
  Input,
  Select,
  prompt,
} from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";
import { unpack } from "./unpack.ts";
import { walk } from "https://deno.land/std/fs/mod.ts";

const { options, cmd } = await new Command()
  .name("pixelblaze")
  .description(
    "A simple CLI to expand and compress Pixelblaze backup (.pbb) files."
  )

  .command("help", new HelpCommand().global())

  .command("completions", new CompletionsCommand())

  // unpack command
  .command("u unpack", "unpack sub-command")
  .option(
    "-i, --input <inputFilePath:string>",
    "Input packed Pixelblaze backup file path",
    { required: true }
  )
  .option(
    "-o, --output <outputDirectoryPath:string>",
    "Output directory path to unpack to",
    { required: true }
  )
  .action(async ({ input, output }) => {
    await unpack(input, output);
  })

  // // pack command
  // .command('p pack', 'pack sub-command')
  // .option('-i, --input <inputDirectoryPath:string>', "Input unpacked directory path")
  // .option('-o, --output <outputFilePath:string>', "Output Pixelblaze backup file path")
  // .action(options => {
  //   console.log({options});
  // })

  .parse(Deno.args);

if (options.validationError) {
  cmd.throw(new ValidationError("validation error message."));
}

if (options.runtimeError) {
  cmd.throw(new Error("runtime error message."));
}

// no action specified, prompt
const action = await Select.prompt({
  message: "unpack or pack?",
  options: ["unpack", "pack"],
});

if (action === "unpack") {
  const { input, output } = await prompt([
    {
      name: "input",
      message: "What Pixelblaze backup (.pbb) file would you like to unpack?",
      type: Input,
      list: true,
      info: true,
      suggestions: async () => {
        const suggestions: string[] = [];
        for await (const entry of walk("./")) {
          if (entry.isFile && entry.name.endsWith(".pbb")) {
            suggestions.push(entry.path);
          }
        }
        return suggestions;
      },
    },
    {
      name: "output",
      message: "Where would you like to unpack the Pixelblaze backup file to?",
      type: Input,
      default: "./tmp",
    },
  ]);

  if (!input && !output) {
    console.error("input file and output directory are required");
  }

  if (!input) {
    console.error("input file is required");
  }

  if (!output) {
    console.error("output file is required");
  }

  if (!input || !output) {
    Deno.exit(1);
  }

  await unpack(input, output);
} else if (action === "pack") {
  console.log("Sorry, pack is not yet supported");
} else {
  cmd.showHelp();
}
