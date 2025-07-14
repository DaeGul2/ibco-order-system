const { Product, ProductIngredient, Ingredient, WarehouseIngredient,
    WarehousePriority, } = require('../models');

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

exports.checkFeasibilityForProduct = async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        const quantityKg = parseFloat(req.query.quantity);
        if (!productId || !quantityKg) {
            return res.status(400).json({ message: 'productId와 quantity가 필요합니다.' });
        }

        // 제품에 필요한 원료 비율 불러오기
        const ingredients = await ProductIngredient.findAll({
            where: { productId },
            include: [{ model: Ingredient }]
        });

        // 창고 우선순위별 정렬
        const warehousePriorities = await WarehousePriority.findAll({
            order: [['priorityOrder', 'ASC']]
        });

        const results = [];

        for (const item of ingredients) {
            const ingredientId = item.ingredientId;
            const percentage = parseFloat(item.amount); // ex. 35 (%)
            const requiredKg = (percentage / 100) * quantityKg;

            // 모든 창고의 보유량 가져오기
            const stockMap = {};
            for (const wp of warehousePriorities) {
                const wi = await WarehouseIngredient.findOne({
                    where: { warehouseId: wp.warehouseId, ingredientId }
                });
                stockMap[wp.warehouseId] = wi ? parseFloat(wi.stockKg) : 0;
            }

            const totalStock = Object.values(stockMap).reduce((a, b) => a + b, 0);
            const topPriorityId = warehousePriorities[0].warehouseId;
            const topStock = stockMap[topPriorityId] || 0;

            if (topStock >= requiredKg) {
                results.push({
                    ingredientId,
                    ingredientName: item.Ingredient?.name,
                    requiredKg,
                    case: 1,
                    details: `✅ 우선순위 1 창고에서 ${requiredKg}kg 사용 가능`
                });
            } else if (totalStock >= requiredKg) {
                results.push({
                    ingredientId,
                    ingredientName: item.Ingredient?.name,
                    requiredKg,
                    case: 2,
                    moveKg: requiredKg - topStock,
                    details: `⚠️ 창고 간 이동 필요: ${requiredKg - topStock}kg`
                });
            } else {
                results.push({
                    ingredientId,
                    ingredientName: item.Ingredient?.name,
                    requiredKg,
                    case: 3,
                    lackingKg: requiredKg - totalStock,
                    details: `❌ 부족: ${requiredKg - totalStock}kg 추가 발주 필요`
                });
            }
        }

        res.status(200).json({ productId, quantityKg, results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '분석 실패', error: err.message });
    }
};