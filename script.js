// Elementos do DOM
const form = document.getElementById('investmentForm');
const riskProfile = document.getElementById('riskProfile');
const investmentAmount = document.getElementById('investmentAmount');
const financialGoal = document.getElementById('financialGoal');
const submitBtn = document.getElementById('submitBtn');
const errorDiv = document.getElementById('error');
const recommendationsDiv = document.getElementById('recommendations');

// Dados DeFi mockados (substituir por API real)
const fetchDeFiData = async () => {
  try {
    // Substituir por chamada real à API da Orca
    const response = await axios.get('https://api.orca.so/pools');
    return response.data.map(pool => ({
      name: pool.name,
      apy: pool.apy,
      volume: pool.volume,
      risk: pool.risk || 'médio'
    }));
  } catch (err) {
    console.error('Erro ao obter dados DeFi:', err);
    return [
      { name: 'Orca USDC/USDT', apy: 5.2, volume: 1000000, risk: 'baixo' },
      { name: 'Raydium SOL/USDC', apy: 12.5, volume: 500000, risk: 'médio' },
      { name: 'Saber BTC/ETH', apy: 20.1, volume: 200000, risk: 'alto' }
    ];
  }
};

// Gerar recomendações mockadas (substituir por API do AImpact)
const getAImpactRecommendations = (userInput, defiData) => {
  try {
    return defiData
      .filter(pool => {
        if (userInput.riskProfile === 'baixo') return pool.risk === 'baixo';
        if (userInput.riskProfile === 'médio') return pool.risk !== 'alto';
        return true;
      })
      .map(pool => ({
        protocol: pool.name,
        apy: pool.apy,
        allocation: parseFloat(userInput.investmentAmount) / defiData.length,
        rationale: `Adequado para perfil de risco ${userInput.riskProfile}`
      }));
  } catch (err) {
    console.error('Erro ao gerar recomendações:', err);
    return [];
  }
};

// Armazenar na blockchain (opcional)
const storeOnChain = async (recommendation) => {
  try {
    const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
    const keypair = solanaWeb3.Keypair.generate(); // Substituir pela keypair do usuário
    const programId = new solanaWeb3.PublicKey('YOUR_PROGRAM_ID');

    const instruction = new solanaWeb3.TransactionInstruction({
      keys: [{ pubkey: keypair.publicKey, isSigner: true, isWritable: true }],
      programId,
      data: Buffer.from(JSON.stringify(recommendation))
    });

    const transaction = new solanaWeb3.Transaction().add(instruction);
    const signature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [keypair]);
    console.log('Armazenado na blockchain:', signature);
  } catch (err) {
    console.error('Erro ao armazenar na blockchain:', err);
  }
};

// Lidar com o envio do formulário
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  errorDiv.style.display = 'none';
  recommendationsDiv.innerHTML = '';

  try {
    const defiData = await fetchDeFiData();
    const userInput = {
      riskProfile: riskProfile.value,
      investmentAmount: investmentAmount.value,
      financialGoal: financialGoal.value
    };
    const recommendations = getAImpactRecommendations(userInput, defiData);

    if (recommendations.length > 0) {
      recommendations.forEach(rec => {
        const recDiv = document.createElement('div');
        recDiv.className = 'recommendation';
        recDiv.innerHTML = `
          <p><strong>Protocolo:</strong> ${rec.protocol}</p>
          <p><strong>APY:</strong> ${rec.apy}%</p>
          <p><strong>Alocação:</strong> $${rec.allocation.toFixed(2)}</p>
          <p><strong>Racional:</strong> ${rec.rationale}</p>
        `;
        recommendationsDiv.appendChild(recDiv);

        // Armazenar na blockchain (opcional)
        storeOnChain(rec);
      });
    } else {
      errorDiv.textContent = 'Nenhuma recomendação gerada.';
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    errorDiv.textContent = 'Falha ao gerar recomendações. Tente novamente.';
    errorDiv.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
  }
});