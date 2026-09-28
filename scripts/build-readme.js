const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/boilerplates.json');
const README_FILE = path.join(__dirname, '../README.md');

async function checkUrl(url, timeout = 8000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.status === 200) {
      return '🟢 Khả dụng';
    } else {
      return '🔴 Không tìm thấy';
    }
  } catch (error) {
    return '🔴 Không tìm thấy';
  }
}

async function buildReadme() {
  const boilerplates = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

  let activeCount = 0;
  const checkedBoilerplates = [];

  for (const bp of boilerplates) {
    const status = await checkUrl(bp.url);
    if (status === '🟢 Khả dụng') {
      activeCount++;
    }
    checkedBoilerplates.push({ ...bp, status });
  }

  const grouped = checkedBoilerplates.reduce((acc, bp) => {
    if (!acc[bp.category]) {
      acc[bp.category] = [];
    }
    acc[bp.category].push(bp);
    return acc;
  }, {});

  const badges = `
![Total Boilerplates](https://img.shields.io/badge/Total-${boilerplates.length}-blue)
![Active Repos](https://img.shields.io/badge/Active-${activeCount}-green)
![Auto Update](https://img.shields.io/badge/Auto%20Update-Daily-orange)
`;

  const intro = `
🚀 Kho Starter Kits & Boilerplates miễn phí giúp Indie Hackers và Vibe Coders "ship" sản phẩm trong 24h. Thay vì tốn hàng tuần cài đặt Auth, Database, Payments, hãy clone ngay các bộ khung có sẵn này để bắt đầu code tính năng lõi!
`;

  let tables = '';
  for (const [category, items] of Object.entries(grouped)) {
    tables += `\n## ${category}\n\n`;
    tables += `| Tên Boilerplate | Các tính năng tích hợp sẵn | Mô tả ngắn | Trạng thái |\n`;
    tables += `|---|---|---|---|\n`;

    for (const item of items) {
      const nameLink = `[${item.name}](${item.url})`;
      tables += `| ${nameLink} | ${item.features} | ${item.description} | ${item.status} |\n`;
    }
  }

  const readme = `# Awesome Free SaaS Boilerplates

${badges}

${intro}

${tables}

---

*Generated automatically on ${new Date().toISOString()}*
`;

  fs.writeFileSync(README_FILE, readme);
  console.log('README.md đã được tạo thành công!');
  console.log(`Tổng số boilerplates: ${boilerplates.length}`);
  console.log(`Số repo khả dụng: ${activeCount}`);
}

buildReadme().catch(console.error);
