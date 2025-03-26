document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsContainer = document.getElementById('results-container');

    searchButton.addEventListener('click', async () => {
        const keyword = searchInput.value.trim();

        // Limpar resultados anteriores
        resultsContainer.innerHTML = '';

        if (!keyword) {
            alert('Por favor, insira uma palavra-chave');
            return;
        }

        try {
            // Mostrar indicador de carregamento
            resultsContainer.innerHTML = '<div class="loading">Buscando produtos...</div>';

            // Fazer requisição para o backend
            const response = await fetch(`http://localhost:3000/api/scrape?keyword=${encodeURIComponent(keyword)}`);
            
            if (!response.ok) {
                throw new Error('Erro na busca de produtos');
            }

            const data = await response.json();

            // Limpar indicador de carregamento
            resultsContainer.innerHTML = '';

            // Verificar se existem produtos
            if (data.products && data.products.length > 0) {
                data.products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.classList.add('product-card');
                    productCard.innerHTML = `
                        <img src="${product.imageUrl}" alt="${product.title}" class="product-image">
                        <div class="product-details">
                            <h3 class="product-title">${product.title}</h3>
                            <p class="product-rating">Avaliação: ${product.rating} ⭐</p>
                            <p class="product-reviews">${product.reviews} avaliações</p>
                        </div>
                    `;
                    resultsContainer.appendChild(productCard);
                });
            } else {
                resultsContainer.innerHTML = '<p>Nenhum produto encontrado.</p>';
            }

        } catch (error) {
            console.error('Erro:', error);
            resultsContainer.innerHTML = `
                <div class="error">
                    Erro ao buscar produtos. 
                    Verifique sua conexão ou tente novamente.
                </div>
            `;
        }
    });
});