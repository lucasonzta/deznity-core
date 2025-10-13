const { queryKnowledge } = require('./utils/pineconeClient');

async function testDocumentoFundacional() {
  try {
    console.log('🔍 Probando consulta del Documento Fundacional...');
    
    // Buscar información específica del documento fundacional
    const results = await queryKnowledge('Deznity self-building AI growth engine misión visión valores', 'deznity-core', 3);
    
    console.log(`✅ Encontrados ${results.length} chunks relevantes:`);
    console.log('');
    
    results.forEach((chunk, index) => {
      console.log(`${index + 1}. ${chunk.filename} (score: ${chunk.score.toFixed(3)})`);
      console.log(`   Contenido: ${chunk.content.substring(0, 200)}...`);
      console.log('');
    });
    
    // Buscar información sobre agentes
    console.log('🤖 Buscando información sobre agentes...');
    const agentResults = await queryKnowledge('agentes especializados PM Web UX SEO QA', 'deznity-core', 2);
    
    console.log(`✅ Encontrados ${agentResults.length} chunks sobre agentes:`);
    agentResults.forEach((chunk, index) => {
      console.log(`${index + 1}. ${chunk.filename} (score: ${chunk.score.toFixed(3)})`);
      console.log(`   Contenido: ${chunk.content.substring(0, 150)}...`);
      console.log('');
    });
    
    console.log('🎉 ¡Documento Fundacional disponible en Pinecone!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDocumentoFundacional();
