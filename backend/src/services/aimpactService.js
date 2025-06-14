const axios = require('axios');

const fetchDeFiData = async (assetType, customAsset) => {
  try {
    // Substitua pela URL real da API AImpact fornecida no desafio
    const response = await axios.get('https://api.aimpact.io/defi/pools', {
      headers: {
        Authorization: `Bearer ${process.env.AIMPACT_API_KEY}`
      }
    });

    let data = response.data.map(pool => ({
      name: pool.name,
      apy: pool.apy,
      volume: pool.volume,
      risk: pool.risk || 'médio',
      type: pool.name.includes('USDC') || pool.name.includes('USDT') ? 'stablecoins' : 'altcoins'
    }));

    // Filtros
    if (assetType === 'stablecoins') {
      data = data.filter(p => p.type === 'stablecoins');
    } else if (assetType === 'altcoins') {
      data = data.filter(p => p.type === 'altcoins');
    } else if (assetType === 'custom' && customAsset) {
      data = data.filter(p => p.name.toLowerCase().includes(customAsset.toLowerCase()));
    }

    return data;
  } catch (error) {
    console.error('Erro ao obter dados da AImpact:', error);
    // Dados mockados como fallback
    let mockData = [
      { name: 'Orca USDC/USDT', apy: 5.2, volume: 1000000, risk: 'baixo', type: 'stablecoins' },
      { name: 'Raydium SOL/USDC', apy: 12.5, volume: 500000, risk: 'médio', type: 'altcoins' },
      { name: 'Saber BTC/ETH', apy: 20.1, volume: 200000, risk: 'alto', type: 'altcoins' }
    ];

    if (assetType === 'stablecoins') {
      mockData = mockData.filter(p => p.type === 'stablecoins');
    } else if (assetType === 'altcoins') {
      mockData = mockData.filter(p => p.type === 'altcoins');
    } else if (assetType === 'custom' && customAsset) {
      mockData = mockData.filter(p => p.name.toLowerCase().includes(customAsset.toLowerCase()));
    }

    return mockData;
  }
};

module.exports = { fetchDeFiData };