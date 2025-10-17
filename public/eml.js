async function GetEml() {
  const emlFilePath = './test.eml';

  try {
    const emlContent = fs.readFileSync(emlFilePath, 'utf-8');

    const parser = new EmlParser(emlContent);

    const parsedEmail = await parser.parseEml();

    const textBody = parsedEmail.text;
    const htmlBody = parsedEmail.html;

    const textParent = document.querySelector('.text-body');
    const textDiv = document.createElement('div');
    textDiv.classList.add(textDiv);
    textDiv.textContent = textBody;
    textParent.appendChild(textDiv);

    const htmlParent = document.querySelector('.html-body');
    const htmlDiv = document.createElement('div');
    htmlDiv.classList.add(htmlDiv);
    htmlDiv.innerHtml = htmlBody;
    htmlParent.appendChild(textDiv);
    console.log(`Text body:`, textBody);
    console.log('Html Body:', htmlBody);
  } catch (err) {
    console.error('error parsing eml file:', err);
  }
}

GetEml();
