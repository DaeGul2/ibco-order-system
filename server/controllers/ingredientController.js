const { Ingredient } = require('../models');

exports.createIngredient = async (req, res) => {
  try {
    const { name, description } = req.body;
    const ingredient = await Ingredient.create({ name, description });
    res.status(201).json(ingredient);
  } catch (err) {
    res.status(500).json({ message: '원료 생성 실패', error: err.message });
  }
};

exports.getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json(ingredients);
  } catch (err) {
    res.status(500).json({ message: '원료 조회 실패', error: err.message });
  }
};

exports.getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByPk(req.params.id);
    if (!ingredient) return res.status(404).json({ message: '원료를 찾을 수 없습니다.' });
    res.status(200).json(ingredient);
  } catch (err) {
    res.status(500).json({ message: '원료 조회 실패', error: err.message });
  }
};

exports.updateIngredient = async (req, res) => {
  try {
    const { name, description } = req.body;
    const ingredient = await Ingredient.findByPk(req.params.id);
    if (!ingredient) return res.status(404).json({ message: '원료를 찾을 수 없습니다.' });

    await ingredient.update({ name, description });
    res.status(200).json(ingredient);
  } catch (err) {
    res.status(500).json({ message: '원료 수정 실패', error: err.message });
  }
};

exports.deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByPk(req.params.id);
    if (!ingredient) return res.status(404).json({ message: '원료를 찾을 수 없습니다.' });

    await ingredient.destroy();
    res.status(204).send(); // 삭제 성공, 내용 없음
  } catch (err) {
    res.status(500).json({ message: '원료 삭제 실패', error: err.message });
  }
};
