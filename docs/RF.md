# Requisitos Funcionais

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RF01 | Permitir cadastro de **Cliente** com nome, e-mail, senha e telefone. | Alta |
| RF02 | Permitir cadastro de **Prestador** com nome, e-mail, senha, telefone, CEP, descrição profissional e seleção de serviços do catálogo (com tipo de cobrança e preço base por serviço). | Alta |
| RF03 | Autenticar usuários via e-mail e senha, com suporte a logout. | Alta |
| RF04 | Exibir perfil público do Prestador (foto, descrição, serviços com preços base, portfólio e avaliações de clientes) e permitir que ambos os perfis editem seus dados de contato, foto, descrição e senha. | Alta |
| RF05 | Permitir que o Cliente gerencie uma lista de locais (nome e CEP) para onde deseja contratar serviços. | Alta |
| RF06 | Permitir que o Prestador configure sua disponibilidade semanal: dias da semana com horário de início e fim de atendimento. | Alta |
| RF07 | Exigir que o Cliente selecione um Local antes de iniciar uma busca, os resultados exibidos são relativos ao CEP daquele Local. | Alta |
| RF08 | Permitir busca de Prestadores com filtros por categoria de serviço, raio de distância (baseado no CEP do Local selecionado), disponibilidade e faixa de preço base, exibindo distância aproximada (ex.: ~3 km) sem expor o CEP exato do Prestador. | Alta |
| RF09 | Permitir que o Cliente acesse o perfil do Prestador, escolha um serviço do catálogo, confirme o Local, informe as datas desejadas (início e fim) e submeta uma solicitação com descrição do problema. | Alta |
| RF10 | Ao receber uma solicitação, permitir que o Prestador analise os detalhes, defina o valor do serviço e envie um orçamento ao Cliente. | Alta |
| RF11 | Permitir que o Cliente aceite ou recuse o orçamento enviado pelo Prestador. | Alta |
| RF12 | Manter histórico completo de agendamentos com os estados: *Pendente*, *Orçamento Enviado*, *Confirmado*, *Em Andamento*, *Concluído* e *Cancelado*. | Alta |
| RF13 | Após serviço concluído, permitir que o **Cliente** avalie o Prestador com nota (1–5) e comentário, exibidos publicamente no perfil do Prestador. | Alta |
| RF14 | Após serviço concluído, permitir que o **Prestador** avalie o Cliente com nota (1–5), visível apenas internamente na plataforma. | Baixa |
| RF15 | Calcular e exibir ranking de Prestadores por média ponderada de avaliações recebidas, quantidade de reviews e proximidade ao Local selecionado pelo Cliente. | Média |
| RF16 | Disparar notificações na plataforma e por e-mail ao alterar o estado de um agendamento. | Baixa |
| RF17 | Permitir que o usuário exclua sua conta, com remoção ou anonimização dos seus dados no banco. | Média |

---

## Funcionalidades Futuras

| ID | Descrição |
|----|-----------|
| RF-F01 | **Gateway de Pagamento:** retenção do valor pago e liberação automática ao Prestador após confirmação de conclusão. |
| RF-F02 | **Chat Interno em Tempo Real:** canal de comunicação direto na plataforma, sem exposição de contatos pessoais. |
| RF-F03 | **Visibilidade restrita do perfil do Cliente:** exibir perfil do Cliente apenas para Prestadores com agendamento ativo ou histórico em comum. |