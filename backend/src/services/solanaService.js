const { Connection, PublicKey, Transaction, TransactionInstruction } = require('@solana/web3.js');
const anchor = require('@project-serum/anchor');
const dotenv = require('dotenv');

dotenv.config();

const storeRecommendation = async (walletAddress, recommendations) => {
  try {
    const connection = new Connection(process.env.SOLANA_CLUSTER, 'confirmed');
    const programId = new PublicKey(process.env.PROGRAM_ID);
    const wallet = new PublicKey(walletAddress);

    // Configurar provedor Anchor
    const provider = new anchor.AnchorProvider(connection, { publicKey: wallet }, { commitment: 'confirmed' });
    anchor.setProvider(provider);

    // Carregar IDL do programa (gerado após `anchor build`)
    const idl = require('../../programs/aimpact_recommender/target/idl/aimpact_recommender.json');
    const program = new anchor.Program(idl, programId, provider);

    // Criar conta para armazenar recomendação
    const [recommendationPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('recommendation'), wallet.toBuffer()],
      programId
    );

    // Dados da recomendação
    const recommendationData = JSON.stringify(recommendations);

    // Chamar função do programa
    await program.rpc.storeRecommendation(recommendationData, {
      accounts: {
        recommendation: recommendationPDA,
        user: wallet,
        systemProgram: anchor.web3.SystemProgram.programId
      },
      signers: []
    });

    console.log('Recomendações armazenadas na blockchain:', recommendationPDA.toString());
  } catch (error) {
    console.error('Erro ao armazenar na blockchain:', error);
    throw error;
  }
};

module.exports = { storeRecommendation };