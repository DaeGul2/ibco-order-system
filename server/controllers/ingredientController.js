const {
  Ingredient,
  IngredientInciKor,
  IngredientInciEng
} = require('../models');

// [CREATE]
exports.createIngredient = async (req, res) => {
  try {
    const {
      name,
      description,
      ewg,
      code,
      usage,
      cost,
      inciKorNames = [],
      inciEngNames = [],
    } = req.body;

    // 원료 생성
    const ingredient = await Ingredient.create({ name, description, ewg, code, usage, cost });

    // INCI_KOR, INCI_ENG 생성
    await Promise.all([
      ...inciKorNames.map(name => IngredientInciKor.create({ ingredientId: ingredient.id, inciKorName: name })),
      ...inciEngNames.map(name => IngredientInciEng.create({ ingredientId: ingredient.id, inciEngName: name })),
    ]);

    res.status(201).json({ message: '원료가 생성되었습니다.', ingredientId: ingredient.id });
  } catch (err) {
    res.status(500).json({ message: '원료 생성 실패', error: err.message });
  }
};

// [READ - ALL]
exports.getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll({
      include: [IngredientInciKor, IngredientInciEng],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(ingredients);
  } catch (err) {
    res.status(500).json({ message: '원료 조회 실패', error: err.message });
  }
};

// [READ - BY ID]
exports.getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByPk(req.params.id, {
      include: [IngredientInciKor, IngredientInciEng],
    });
    if (!ingredient) return res.status(404).json({ message: '원료를 찾을 수 없습니다.' });
    res.status(200).json(ingredient);
  } catch (err) {
    res.status(500).json({ message: '원료 조회 실패', error: err.message });
  }
};

// [UPDATE]
exports.updateIngredient = async (req, res) => {
  try {
    const {
      name,
      description,
      ewg,
      code,
      usage,
      cost,
      inciKorNames = [],
      inciEngNames = [],
    } = req.body;

    const ingredient = await Ingredient.findByPk(req.params.id);
    if (!ingredient) return res.status(404).json({ message: '원료를 찾을 수 없습니다.' });

    await ingredient.update({ name, description, ewg, code, usage, cost });

    // 기존 INCI들 삭제 후 재삽입
    await IngredientInciKor.destroy({ where: { ingredientId: ingredient.id } });
    await IngredientInciEng.destroy({ where: { ingredientId: ingredient.id } });

    await Promise.all([
      ...inciKorNames.map(name => IngredientInciKor.create({ ingredientId: ingredient.id, inciKorName: name })),
      ...inciEngNames.map(name => IngredientInciEng.create({ ingredientId: ingredient.id, inciEngName: name })),
    ]);

    res.status(200).json({ message: '원료가 수정되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '원료 수정 실패', error: err.message });
  }
};

// [DELETE]
exports.deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByPk(req.params.id);
    if (!ingredient) return res.status(404).json({ message: '원료를 찾을 수 없습니다.' });

    // 관련 INCI 정보 삭제
    await IngredientInciKor.destroy({ where: { ingredientId: ingredient.id } });
    await IngredientInciEng.destroy({ where: { ingredientId: ingredient.id } });

    await ingredient.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: '원료 삭제 실패', error: err.message });
  }
};
