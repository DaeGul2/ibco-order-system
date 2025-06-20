const { Product, ProductIngredient, Ingredient } = require('../models');

// 제품 생성 + 원료 구성 등록
exports.createProduct = async (req, res) => {
    const { name, ingredients } = req.body;
    try {
        const product = await Product.create({ name });

        if (Array.isArray(ingredients)) {
            const items = ingredients.map((item) => ({
                productId: product.id,
                ingredientId: item.ingredientId,
                amount: item.amount,
            }));
            await ProductIngredient.bulkCreate(items);
        }

        res.status(201).json({ message: '제품이 생성되었습니다.', productId: product.id });
    } catch (err) {
        res.status(500).json({ message: '제품 생성 실패', error: err.message });
    }
};

// 전체 제품 목록
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({ order: [['createdAt', 'DESC']] });
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: '제품 목록 조회 실패', error: err.message });
    }
};

// 특정 제품 상세 (원료 구성 포함)
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: '제품을 찾을 수 없습니다.' });

        const ingredients = await ProductIngredient.findAll({
            where: { productId: product.id },
            include: [{ model: Ingredient, attributes: ['name'] }],
        });

        res.status(200).json({ product, ingredients });
    } catch (err) {
        res.status(500).json({ message: '제품 상세 조회 실패', error: err.message });
    }
};

// 제품 + 구성 수정
exports.updateProduct = async (req, res) => {
    const { name, ingredients } = req.body;
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: '제품을 찾을 수 없습니다.' });

        await product.update({ name });

        // 기존 구성 삭제 → 새로 등록
        await ProductIngredient.destroy({ where: { productId: product.id } });

        if (Array.isArray(ingredients)) {
            const items = ingredients.map((item) => ({
                productId: product.id,
                ingredientId: item.ingredientId,
                amount: item.amount,
            }));
            await ProductIngredient.bulkCreate(items);
        }

        res.status(200).json({ message: '제품이 수정되었습니다.' });
    } catch (err) {
        res.status(500).json({ message: '제품 수정 실패', error: err.message });
    }
};

// 제품 삭제
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: '제품을 찾을 수 없습니다.' });

        await ProductIngredient.destroy({ where: { productId: product.id } });
        await product.destroy();

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: '제품 삭제 실패', error: err.message });
    }
};
