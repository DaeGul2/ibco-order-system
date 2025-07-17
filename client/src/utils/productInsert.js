import * as XLSX from 'xlsx';

export const parseProductExcel = async (file, ingredientList) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const ingredientNames = ingredientList.map(i => i.name);

  const result = [];

  workbook.SheetNames.forEach(sheetName => {
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    const productMap = {};

    sheet.forEach(row => {
      const productName = row['제품명'];
      const ingredientName = row['원료명'];
      const amount = row['함량'];

      const exists = ingredientNames.includes(ingredientName);

      if (!productMap[productName]) {
        productMap[productName] = [];
      }

      productMap[productName].push({
        originalName: ingredientName,
        correctedName: exists ? ingredientName : '', // 사용자 선택 가능
        amount,
        exists
      });
    });

    const products = Object.entries(productMap).map(([name, ingredients]) => ({
      name,
      ingredients
    }));

    result.push({ sheetName, products });
  });

  return result;
};
