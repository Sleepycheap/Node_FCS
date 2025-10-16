import { EmlParser } from 'eml-parser';
import fs from 'fs';

console.log('Hello there!');

const emlFilePath = 'test.eml';

async function getEmlBody() {
  try {
    const emlContent = fs.readFileSync(emlFilePath, 'utf-8');

    const parser = new EmlParser(emlContent);

    const parsedEmail = await parser.parseEml();

    const textBody = parsedEmail.text;
    const htmlBody = parsedEmail.html;

    console.log(`Text Body:`, textBody);
    console.log('HTML Body:', htmlBody);
  } catch (err) {
    console.err('error parsing eml file:', err);
  }
}

getEmlBody();
