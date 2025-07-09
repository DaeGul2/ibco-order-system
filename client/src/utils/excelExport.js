import * as XLSX from 'xlsx';

export const exportOrderDetailToExcel = (orderData) => {
  const wb = XLSX.utils.book_new();

  // ===============================
  // 📄 시트 1: 발주 전체 원료 총합
  // ===============================
  const totalList = orderData.ingredientSummary.map((item, idx) => {
    const name = item.Ingredient?.name || `ID ${item.ingredientId}`;
    const unitCost = item.unitCost ?? 0;
    const amount = parseFloat(item.totalAmountKg || 0);
    const totalCost = Math.round(item.totalCost || amount * unitCost);

    return {
      연번: idx + 1,
      원료명: name,
      '수량(kg)': amount,
      '단가(₩/kg)': unitCost,
      '총 비용(₩)': totalCost,
    };
  });

  // 👉 마지막 행에 전체 발주 총합
  const totalOrderCost = totalList.reduce((sum, row) => sum + row['총 비용(₩)'], 0);
  totalList.push({
    연번: '',
    원료명: '💰 전체 발주 원료 총 비용',
    '수량(kg)': '',
    '단가(₩/kg)': '',
    '총 비용(₩)': totalOrderCost,
  });

  const ws1 = XLSX.utils.json_to_sheet(totalList);
  XLSX.utils.book_append_sheet(wb, ws1, '발주_전체원료_리스트');

  // ===============================
  // 📄 시트 2 ~ N: 제품별 원료 스냅샷
  // ===============================
  const snapshotMap = {};
  orderData.orderProductIngredients?.forEach((row) => {
    if (!snapshotMap[row.productId]) snapshotMap[row.productId] = [];
    snapshotMap[row.productId].push(row);
  });

  orderData.items.forEach((item) => {
    const ingredients = snapshotMap[item.productId] || [];

    const rows = ingredients.map((pi, idx) => {
      return {
        연번: idx + 1,
        원료명: pi.Ingredient?.name || `ID ${pi.ingredientId}`,
        '1kg당 비율(%)': pi.amountPerKg,
        '제조량(kg)': item.quantityKg,
        '수량(kg)': parseFloat(pi.totalAmountKg || 0),
        '단가(₩/kg)': pi.unitCost,
        '총 비용(₩)': Math.round(pi.totalCost),
      };
    });

    const sheetName = item.Product?.name || `제품_${item.productId}`;
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31)); // 시트명 31자 제한
  });

  // ===============================
  // ✅ 저장
  // ===============================
  XLSX.writeFile(wb, `${orderData.order.title || '발주내역'}.xlsx`);
};
