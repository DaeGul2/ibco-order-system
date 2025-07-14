import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './pages/PrivateRoute';
import SidebarLayout from './components/SidebarLayout';
import MainPage from './pages/MainPage';
import IngredientPage from './pages/IngredientPage';
import ProductPage from './pages/ProductPage';
import OrderPage from './pages/OrderPage';
import WarehousePage from './pages/WarehousePage';
import WarehouseIngredientPage from './pages/WarehouseIngredientPage'; // ✅ 추가
import IngredientOrderPage from './pages/IngredientOrderPage'; // 👈 추가

// 샘플용
const Placeholder = ({ title }) => <h2>{title}</h2>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <SidebarLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<MainPage />} />

            <Route path="ingredients/list" element={<IngredientPage />} />
            <Route path="orders/productlist" element={<OrderPage />} />
            <Route path="products/list" element={<ProductPage />} />
            <Route path="warehouses/manage" element={<WarehousePage />} />
            <Route path="warehouses/ingredients" element={<WarehouseIngredientPage />} /> {/* ✅ 추가 */}
            <Route path="orders/ingredientlist" element={<IngredientOrderPage />} /> {/* ✅ 추가 */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
