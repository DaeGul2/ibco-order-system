// client/src/components/ProductDetailModal.js
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Table, TableHead, TableBody, TableRow, TableCell
} from '@mui/material';

const ProductDetailModal = ({ open, onClose, data }) => {
  if (!data) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>제품 상세 정보</DialogTitle>
      <DialogContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          📦 제품명: {data.product.name}
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          🧪 원료 구성
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>번호</TableCell>
              <TableCell>원료명</TableCell>
              <TableCell align="right">함량 (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.ingredients.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{item.Ingredient?.name || `(ID ${item.ingredientId})`}</TableCell>
                <TableCell align="right">{item.amount}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={2}><strong>총합</strong></TableCell>
              <TableCell align="right">
                <strong>
                  {data.ingredients.reduce((sum, item) => sum + Number(item.amount || 0), 0)}
                </strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDetailModal;
