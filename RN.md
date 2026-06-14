# Regras de Negócio

1. Um usuário só pode se cadastrar com um e-mail que ainda não esteja em uso na plataforma.
2. Um usuário não pode ser Cliente e Prestador ao mesmo tempo com a mesma conta.
3. Um Cliente só pode avaliar um Prestador após um agendamento com status *Concluído*.
4. Cada parte (Cliente e Prestador) pode avaliar um agendamento no máximo uma vez — garantido por constraint no banco.
5. O agendamento só avança para *Confirmado* após o Cliente aceitar explicitamente o orçamento enviado pelo Prestador.
6. O Prestador pode cancelar um agendamento *Confirmado*, mas o Cliente deve ser notificado via atualização de status na plataforma.
7. A distância exibida é calculada com base no CEP do Cliente (sessão) e no CEP do Prestador, aproximada para o km mais próximo — o CEP exato nunca é exposto.
8. O ranking pondera: média de avaliações (peso 50%), quantidade de reviews (peso 30%) e proximidade por raio (peso 20%).
9. *(A confirmar)* Um Cliente não pode abrir nova solicitação ao mesmo Prestador enquanto houver agendamento *Pendente* ou *Confirmado* em aberto entre eles.