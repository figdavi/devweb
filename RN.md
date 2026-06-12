# Regras de Negócio

1. Um usuário só pode se cadastrar com um e-mail que ainda não esteja em uso na plataforma.
2. Um usuário não pode ser Cliente e Prestador ao mesmo tempo com a mesma conta.
3. Um cliente só pode avaliar um prestador após um serviço com status *Concluído*.
5. A distância exibida é calculada com base no CEP do cliente (informado no login/sessão) e no CEP do prestador, aproximada para o km mais próximo.
6. O ranking de busca pondera: média de avaliações (peso 50%), número de avaliações (peso 30%) e proximidade por raio (peso 20%).
7. O fluxo de pagamento simulado registra valor, método e status no banco, mas não realiza transações financeiras reais.
8. O prestador pode cancelar um agendamento confirmado, mas o cliente deve ser notificado via atualização de status na plataforma.
4. *(A confirmar)* Um cliente não pode fazer uma nova solicitação ao mesmo prestador se já existe uma solicitação pendente ou confirmada em aberto.