const { program } = require("commander");
const fs = require('fs');
const axios = require('axios');

// Оголошення параметрів командного рядка
program
  .requiredOption("-i, --input <path>", "Path to input JSON file")
  .option("-o, --output <path>", "Path to output file")
  .option("-d, --display", "Display output in console");

program.parse(process.argv);

const options = program.opts();

function main() {
  if (!options.input) {
    console.error("Please, specify input file (-i)");
    process.exit(1);
  }

  if (!fs.existsSync(options.input)) {
    console.error("Cannot find input file");
    process.exit(1);
  }

  console.log("Input file:", options.input);
  console.log("Output file:", options.output || "Not specified");
  console.log("Display:", options.display ? "Yes" : "No");

  // Функція для завантаження даних з НБУ
  async function fetchCurrencyData() {
      try {
          const response = await axios.get('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
          fs.writeFileSync('data.json', JSON.stringify(response.data, null, 2)); // збереження у файл
          console.log('Data saved to data.json');
      } catch (error) {
          console.error('Error fetching data:', error);
      }
  }

  // Якщо файл не існує, завантажуємо дані з НБУ
  if (!fs.existsSync(options.input)) {
      console.log('Input file not found, fetching data from NBU...');
      fetchCurrencyData();  // асинхронне завантаження даних
  }

  // Читання даних з JSON файлу
  let data;
  try {
      data = JSON.parse(fs.readFileSync(options.input, 'utf8'));
  } catch (error) {
      console.error('Error reading input file:', error);
      process.exit(1);
  }

  // Перевірка, чи є дані
  if (!data || !Array.isArray(data)) {
    console.error("Invalid or empty data.");
    process.exit(1);
  }

  // Функція для пошуку активу з найменшим значенням
  function findMinCurrency(data) {
      let minCurrency = null;

      data.forEach(item => {
          if (minCurrency === null || item.rate < minCurrency.rate) {
              minCurrency = item;
          }
      });

      return minCurrency;
  }

  const minCurrency = findMinCurrency(data);
  console.log(minCurrency); // для перевірки

  // Виведення результату в консоль або файл
  if (options.display) {
      console.log(`${minCurrency.txt}: ${minCurrency.rate}`);
  }

  const outputPath = options.output || 'output.txt';  // шлях до вихідного файлу
  fs.writeFileSync(outputPath, `${minCurrency.txt}:${minCurrency.rate}`);
  console.log(`Result written to: ${outputPath}`);
}

main();
