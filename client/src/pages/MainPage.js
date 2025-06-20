// client/src/pages/MainPage.js
import { Typography, Container } from '@mui/material';

const MainPage = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        메인 페이지입니다.
      </Typography>
      <Typography>로그인 성공!</Typography>
    </Container>
  );
};

export default MainPage;
