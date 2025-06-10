// Elementos do DOM
const form = document.getElementById('investmentForm');
const riskProfile = document.getElementById('riskProfile');
const investmentAmount = document.getElementById('investmentAmount');
const financialGoalCheckboxes = document.querySelectorAll('#financialGoal input[type="checkbox"]');
const assetType = document.getElementById('assetType');
const customAsset = document.getElementById('customAsset');
const submitBtn = document.getElementById('submitBtn');
const errorDiv = document.getElementById('error');
const recommendationsDiv = document.getElementById('recommendations');
const walletStatus = document.getElementById('walletStatus');
const selectionLimit = document.getElementById('selectionLimit');
const connectWalletBtn = document.getElementById('connectWalletBtn');
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
const riskError = document.getElementById('riskError');
const amountError = document.getElementById('amountError');
const goalError = document.getElementById('goalError');
const assetError = document.getElementById('assetError');

// Função para alternar o campo customizado
function toggleCustomAsset() {
  customAsset.style.display = assetType.value === 'custom' ? 'block' : 'none';
  if (assetType.value !== 'custom') customAsset.value = '';
}

// Limitar a seleção a 5 opções
function limitSelections() {
  const selectedCheckboxes = Array.from(financialGoalCheckboxes).filter(checkbox => checkbox.checked).length;
  if (selectedCheckboxes > 5) {
    event.target.checked = false;
    selectionLimit.textContent = 'Limite de 5 seleções atingido.';
    selectionLimit.style.display = 'block';
    setTimeout(() => selectionLimit.style.display = 'none', 2000);
  } else {
    selectionLimit.style.display = 'none';
  }
}

// Toggle de navegação móvel
navToggle.addEventListener('click', () => {
  navList.classList.toggle('active');
});

// Configuração da carteira Phantom
let phantomWallet = null;
const connectWallet = async () => {
  if (window.solana && window.solana.isPhantom) {
    try {
      const response = await window.solana.connect();
      phantomWallet = window.solana;
      walletStatus.textContent = `Conectado: ${response.publicKey.toString().slice(0, 6)}...${response.publicKey.toString().slice(-4)}`;
      walletStatus.classList.add('connected');
      connectWalletBtn.style.display = 'none';
    } catch (err) {
      walletStatus.textContent = 'Falha na conexão. Tente novamente.';
      walletStatus.classList.remove('connected');
      console.error('Erro ao conectar carteira:', err);
    }
  } else {
    walletStatus.textContent = 'Instale a extensão Phantom Wallet.';
    walletStatus.classList.remove('connected');
  }
};

connectWalletBtn.addEventListener('click', connectWallet);

// Validação do formulário
function validateForm() {
  let isValid = true;

  // Resetar mensagens de erro
  riskError.style.display = 'none';
  amountError.style.display = 'none';
  goalError.style.display = 'none';
  assetError.style.display = 'none';

  if (!riskProfile.value) {
    riskError.textContent = 'Selecione um perfil de risco.';
    riskError.style.display = 'block';
    isValid = false;
  }

  if (!investmentAmount.value || investmentAmount.value <= 0) {
    amountError.textContent = 'Digite um valor válido maior que 0.';
    amountError.style.display = 'block';
    isValid = false;
  }

  const selectedGoals = Array.from(financialGoalCheckboxes).filter(checkbox => checkbox.checked);
  if (selectedGoals.length === 0) {
    goalError.textContent = 'Selecione pelo menos um objetivo.';
    goalError.style.display = 'block';
    isValid = false;
  } else if (selectedGoals.length > 5) {
    goalError.textContent = 'Máximo de 5 objetivos permitidos.';
    goalError.style.display = 'block';
    isValid = false;
  }

  if (!assetType.value) {
    assetError.textContent = 'Selecione uma opção de análise.';
    assetError.style.display = 'block';
    isValid = false;
  } else if (assetType.value === 'custom' && !customAsset.value) {
    assetError.textContent = 'Digite um par específico.';
    assetError.style.display = 'block';
    isValid = false;
  }

  submitBtn.disabled = !isValid || !phantomWallet;
  return isValid;
}

// Dados DeFi mockados
const fetchDeFiData = async () => {
  try {
    const response = await axios.get('https://api.orca.so/pools');
    let data = response.data.map(pool => ({
      name: pool.name,
      apy: pool.apy,
      volume: pool.volume,
      risk: pool.risk || 'médio',
      type: pool.name.includes('USDC') || pool.name.includes('USDT') ? 'stablecoins' : 'altcoins'
    }));
    if (assetType.value === 'stablecoins') data = data.filter(p => p.type === 'stablecoins');
    else if (assetType.value === 'altcoins') data = data.filter(p => p.type === 'altcoins');
    else if (assetType.value === 'custom' && customAsset.value) {
      data = data.filter(p => p.name.toLowerCase().includes(customAsset.value.toLowerCase()));
    }
    return data;
  } catch (err) {
    console.error('Erro ao obter dados DeFi:', err);
    let mockData = [
      { name: 'Orca USDC/USDT', apy: 5.2, volume: 1000000, risk: 'baixo', type: 'stablecoins' },
      { name: 'Raydium SOL/USDC', apy: 12.5, volume: 500000, risk: 'médio', type: 'altcoins' },
      { name: 'Saber BTC/ETH', apy: 20.1, volume: 200000, risk: 'alto', type: 'altcoins' }
    ];
    if (assetType.value === 'stablecoins') mockData = mockData.filter(p => p.type === 'stablecoins');
    else if (assetType.value === 'altcoins') mockData = mockData.filter(p => p.type === 'altcoins');
    else if (assetType.value === 'custom' && customAsset.value) {
      mockData = mockData.filter(p => p.name.toLowerCase().includes(customAsset.value.toLowerCase()));
    }
    return mockData;
  }
};

// Gerar recomendações
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
        allocation: parseFloat(userInput.investmentAmount) / defiData.length || 0,
        rationale: `Adequado para ${userInput.riskProfile} risco, objetivos: ${userInput.financialGoals.join(', ')}`
      }));
  } catch (err) {
    console.error('Erro ao gerar recomendações:', err);
    return [];
  }
};

// Armazenar na blockchain
const storeOnChain = async (recommendation) => {
  if (phantomWallet) {
    try {
      const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
      const publicKey = phantomWallet.publicKey;
      const programId = new solanaWeb3.PublicKey('YOUR_PROGRAM_ID');

      const instruction = new solanaWeb3.TransactionInstruction({
        keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
        programId,
        data: Buffer.from(JSON.stringify(recommendation))
      });

      const transaction = new solanaWeb3.Transaction().add(instruction);
      const { signature } = await phantomWallet.signAndSendTransaction(transaction);
      console.log('Transação na blockchain:', signature);
    } catch (err) {
      console.error('Erro ao armazenar na blockchain:', err);
    }
  }
};

// Lidar com o envio do formulário
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  errorDiv.style.display = 'none';
  recommendationsDiv.innerHTML = '';

  if (!validateForm()) {
    submitBtn.disabled = false;
    return;
  }

  try {
    const defiData = await fetchDeFiData();
    const selectedGoals = Array.from(financialGoalCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value)
      .slice(0, 5);
    const userInput = {
      riskProfile: riskProfile.value,
      investmentAmount: investmentAmount.value,
      financialGoals: selectedGoals,
      assetType: assetType.value,
      customAsset: customAsset.value
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
        storeOnChain(rec);
      });
    } else {
      errorDiv.textContent = 'Nenhuma recomendação gerada.';
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    errorDiv.textContent = 'Erro ao processar. Tente novamente.';
    errorDiv.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
  }
});

// Adicionar evento para limitar seleções de checkboxes
financialGoalCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', limitSelections);
});

// Adicionar evento para alternar campo customizado
assetType.addEventListener('change', toggleCustomAsset);