const { program } = require("commander");

program
  .requiredOption("-i, --input <path>", "Path to input JSON file") 
  .option("-o, --output <path>", "Path to output file") 
  .option("-d, --display", "Display output in console"); 

program.parse(process.argv);

const options = program.opts();

if (!options.input) {
  console.error("Please, specify input file");
  process.exit(1);
}

console.log("Input file:", options.input);
console.log("Output file:", options.output || "Not specified");
console.log("Display:", options.display ? "Yes" : "No");
