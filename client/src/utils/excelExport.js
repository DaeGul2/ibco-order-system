// client/src/utils/excelExport.js
import * as XLSX from 'xlsx';

export const exportOrderDetailToExcel = (orderData, productIngredientsMap) => {
  const wb = XLSX.utils.book_new();

  // ✅ Sheet1: 발주_전체원료_리스트
  const totalList = orderData.ingredientSummary.map((item, idx) => ({
    연번: idx + 1,
    원료명: item.Ingredient?.name || `ID ${item.ingredientId}`,
    '수량(kg)': item.totalAmountKg,
  }));
  const ws1 = XLSX.utils.json_to_sheet(totalList);
  XLSX.utils.book_append_sheet(wb, ws1, '발주_전체원료_리스트');

  // ✅ Sheet2 ~ N: 각 제품별
  orderData.items.forEach((item) => {
    const ingredients = productIngredientsMap[item.productId] || [];
    const rows = ingredients.map((pi, idx) => ({
      연번: idx + 1,
      원료명: pi.Ingredient?.name || `ID ${pi.ingredientId}`,
      '수량(kg)': parseFloat((pi.amount / 100) * item.quantityKg).toFixed(4),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const sheetName = item.Product?.name || `제품_${item.productId}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31)); // 시트 이름 제한
  });

  // ✅ 파일 다운로드
  XLSX.writeFile(wb, `${orderData.order.title || '발주내역'}.xlsx`);
};
