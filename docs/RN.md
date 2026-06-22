# Regras de Negócio

1. Um usuário só pode se cadastrar com um e-mail que ainda não esteja em uso na plataforma.
2. Um usuário não pode ser Cliente e Prestador ao mesmo tempo com a mesma conta.
3. Um Cliente só pode avaliar um Prestador após um agendamento com status *Concluído*.
4. Cada parte (Cliente e Prestador) pode avaliar um agendamento no máximo uma vez, garantido por constraint no banco.
5. O agendamento só avança para *Confirmado* após o Cliente aceitar explicitamente o orçamento enviado pelo Prestador.
6. O Prestador pode cancelar um agendamento *Confirmado*, mas o Cliente deve ser notificado via atualização de status na plataforma.
7. A distância exibida é calculada com base no CEP do **Local selecionado pelo Cliente** e no CEP do Prestador, aproximada para o km mais próximo, o CEP exato nunca é exposto.
8. O Cliente deve selecionar um Local antes de iniciar uma busca, os resultados são sempre relativos ao Local selecionado, não ao CEP cadastrado na conta.
9. O ranking pondera: média de avaliações (peso 50%), quantidade de reviews (peso 30%) e proximidade do Local selecionado ao Prestador (peso 20%).
10. Um agendamento deve referenciar exatamente um Local da lista do Cliente, o serviço é prestado naquele Local específico, não para o Cliente em geral.
11. O valor final do serviço é definido pelo Prestador no orçamento, não pelo Cliente na solicitação, o preço base no catálogo serve apenas como referência para busca.
12. *(A confirmar)* Um Cliente não pode abrir nova solicitação ao mesmo Prestador para o mesmo serviço enquanto houver agendamento *Pendente* ou *Confirmado* em aberto entre eles.