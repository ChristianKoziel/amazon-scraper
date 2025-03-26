import express from "express";
import axios from "axios";
import { JSDOM } from "jsdom";
import cors from "cors";

const app = express();
const PORT = 3000;

// Middleware para permitir requisições de diferentes origens
app.use(cors());

// Endpoint de scraping
app.get("/api/scrape", async (req, res) => {
    const { keyword } = req.query;

    // Validação da palavra-chave
    if (!keyword) {
        return res.status(400).json({ 
            error: "Uma palavra-chave de pesquisa é obrigatória" 
        });
    }

    try {
        // Configuração de headers para simular navegador
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive'
        };

        // Buscar página de resultados da Amazon
        const response = await axios.get(`https://www.amazon.com.br/s?k=${encodeURIComponent(keyword)}`, { headers });

        // Processar HTML com JSDOM
        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        // Array para armazenar produtos
        const products = [];

        // Selecionar todos os itens de resultado
        const productElements = document.querySelectorAll('[data-component-type="s-search-result"]');

        // Iterar sobre elementos de produtos
        productElements.forEach(item => {
            try {
                // Extrair título
                const titleElement = item.querySelector('h2 a .a-size-mini');
                const title = titleElement ? titleElement.textContent.trim() : 'Título não disponível';

                // Extrair URL da imagem
                const imageElement = item.querySelector('.s-image');
                const imageUrl = imageElement ? imageElement.getAttribute('src') : null;

                // Extrair avaliação
                const ratingElement = item.querySelector('.a-icon-star-small .a-icon-alt');
                const rating = ratingElement ? ratingElement.textContent.split(' ')[0] : 'Sem avaliação';

                // Extrair número de reviews
                const reviewsElement = item.querySelector('.a-size-base.s-underline-text');
                const reviews = reviewsElement ? reviewsElement.textContent.trim() : '0 avaliações';

                // Adicionar produto ao array se tiver título e imagem
                if (title && imageUrl) {
                    products.push({ 
                        title, 
                        rating, 
                        reviews, 
                        imageUrl 
                    });
                }
            } catch (itemError) {
                console.error("Erro ao processar item:", itemError);
            }
        });

        // Responder com produtos encontrados
        res.json({ products });

    } catch (error) {
        console.error("Erro na extração:", error.message);
        res.status(500).json({ 
            error: "Erro ao buscar produtos", 
            details: error.message 
        });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});