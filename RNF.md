# Requisitos Não-Funcionais

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RNF01 | Senhas e dados sensíveis armazenados com hash robusto (BCrypt/`password_hash`). Sistema em conformidade com as diretrizes da LGPD. | Alta |
| RNF02 | Sistema desenvolvido exclusivamente com HTML5, CSS3, Bootstrap 5, JavaScript, PHP e MySQL. | Alta |
| RNF03 | Sistema hospedado em serviço gratuito (InfinityFree ou X10Hosting) e acessível publicamente via URL. | Alta |
| RNF04 | Interface responsiva, adaptada a mobile e desktop via grid do Bootstrap. | Média |
| RNF05 | Estado de autenticação mantido entre páginas via sessões PHP. | Baixa |
| RNF06 | CEP e coordenadas exatas dos Prestadores nunca expostos publicamente — apenas distância aproximada em raio. | Alta |
| RNF07 | Todas as entradas de usuário sanitizadas e validadas para prevenção de SQL Injection e XSS. | Média |
| RNF08 | Banco de dados relacional normalizado (mín. 3FN), com chaves primárias, estrangeiras e índices nas colunas de busca. | Alta |
| RNF09 | Páginas principais com tempo de carregamento de até 5 segundos na hospedagem gratuita. | Média |
| RNF10 | Mensagens de erro claras e amigáveis ao usuário, sem expor detalhes técnicos internos. | Média |
| RNF11 | Upload de imagens com validação de tipo (JPEG/PNG) e limite de tamanho de arquivo. | Alta |