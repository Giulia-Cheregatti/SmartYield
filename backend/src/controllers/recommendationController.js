const aimpactService = require('../services/aimpactService');
const solanaService = require('../services/solanaService');

const getRecommendations = async (req, res) => {
  try {
    const { riskProfile, investmentAmount, financialGoals, assetType, customAsset, walletAddress } = req.body;

    // Validar entrada
    if (!riskProfile || !investmentAmount || !financialGoals.length || !assetType || !walletAddress) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }
    if (financialGoals.length > 5) {
      return res.status(400).json({ error: 'Máximo de 5 objetivos financeiros permitidos.' });
    }
    if (assetType === 'custom' && !customAsset) {
      return res.status(400).json({ error: 'Par personalizado é obrigatório para tipo custom.' });
    }

    // Obter dados da API AImpact
    const defiData = await aimpactService.fetchDeFiData(assetType, customAsset);

    // Filtrar recomendações com base no perfil de risco
    const recommendations = defiData
      .filter(pool => {
        if (riskProfile === 'baixo') return pool.risk === 'baixo';
        if (riskProfile === 'médio') return pool.risk !== 'alto';
        return true;
      })
      .map(pool => ({
        protocol: pool.name,
        apy: pool.apy,
        allocation: parseFloat(investmentAmount) / defiData.length || 0,
        rationale: `Adequado para ${riskProfile} risco, objetivos: ${financialGoals.join(', ')}`
      }));

    if (recommendations.length === 0) {
      return res.status(404).json({ error: 'Nenhuma recomendação encontrada.' });
    }

    // Armazenar na blockchain
    await solanaService.storeRecommendation(walletAddress, recommendations);

    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Erro ao gerar recomendações:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = { getRecommendations };