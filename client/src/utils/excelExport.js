import * as XLSX from 'xlsx';

export const exportOrderDetailToExcel = (orderData, productIngredientsMap) => {
  const wb = XLSX.utils.book_new();

  // ✅ Sheet1: 발주_전체원료_리스트 (총 수량, 단가, 총 비용 포함)
  const totalList = orderData.ingredientSummary.map((item, idx) => {
    const name = item.Ingredient?.name || `ID ${item.ingredientId}`;
    const cost = item.Ingredient?.cost ?? 0;
    const amount = parseFloat(item.totalAmountKg || 0);
    return {
      연번: idx + 1,
      원료명: name,
      '수량(kg)': amount,
      '단가(₩/kg)': cost,
      '총 비용(₩)': Math.round(amount * cost),
    };
  });
  const ws1 = XLSX.utils.json_to_sheet(totalList);
  XLSX.utils.book_append_sheet(wb, ws1, '발주_전체원료_리스트');

  // ✅ Sheet2 ~ N: 각 제품별 (비율, 단가, 비용 포함)
  orderData.items.forEach((item) => {
    const ingredients = productIngredientsMap[item.productId] || [];
    const rows = ingredients.map((pi, idx) => {
      const amount = (pi.amount / 100) * item.quantityKg;
      const name = pi.Ingredient?.name || `ID ${pi.ingredientId}`;
      const cost = pi.Ingredient?.cost ?? 0;
      return {
        연번: idx + 1,
        원료명: name,
        '1kg당 비율(%)': pi.amount,
        '제조량(kg)': item.quantityKg,
        '수량(kg)': parseFloat(amount.toFixed(4)),
        '단가(₩/kg)': cost,
        '총 비용(₩)': Math.round(amount * cost),
      };
    });

    const sheetName = item.Product?.name || `제품_${item.productId}`;
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  });

  // ✅ 파일 다운로드
  XLSX.writeFile(wb, `${orderData.order.title || '발주내역'}.xlsx`);
};
