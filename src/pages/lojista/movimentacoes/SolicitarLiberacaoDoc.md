**🧭 CHECKLIST DE DESENVOLVIMENTO DE FEATURES (VERSAO 2.0.1)**

## ✅ Solicitação de Liberação


📌Descrição das principais funcionalidades do componente:


📌*Funções principais:*

- Solicitação de liberação de veiculos para a saida nas cancelas, permitindo a saída dos veiculos;
- Consulta a uma solicitação com possivel cancelamento;



**################################################################################################**

📌*Fluxo de trabalho do componente:*

1 - Quando solicitada uma liberação, os dados *placa*, *motivo*, *solicitante* e *observação* juntamente com o *username* do usuario solicitante (para fins de auditoria), sao salvos nas tabelas **movimentacao** e **movimentacao_registro**. Assim que o veiculo passa pela cancela, o registro na tabela movimentacoes, é excluido, exigindo que, para uma **nova saída**, seja registrada uma nova **solicitação**;

2 - Quando a solicitação for por motivo de **VENDA**, **TRANSFERENCIA** ou **DEVOLUÇÃO**, ao clicar em **ENVIAR**, o usuario será alertado que o veículo será **baixado imediatamente**. Caso ele confirme a solicitação de liberação pelos motivos acima apresentados, o veículo terá a sua baixa efetuada da base de dados e, em caso de necessidade que o veículo entre novamente, deverá realizar um novo cadastro do veículo. Os dados principais do veículo serão salvos na tabela **baixas** para fim de conservação de histórico e auditoria;

3 - Caso deseje cancelar uma solicitação, no campo **CONSULTAR UMA SOLICITAÇÃO DE LIBERAÇÃO** o usuario deverá informar a **placa** do veículo. Caso haja uma solicitação de liberação em aberto os dados serão retornados. Caso deseje cancelar a solicitação, basta que ele clique no botão **CANCELAR LIBERAÇÃO** e confirme a solicitação. A solicitação será excluida da tabela **movimentacao**. Em caso de solicitações por motivo de **VENDA**, **TRANSFERENCIA** ou **DEVOLUÇÃO**, o veículo deverá ser recadastrado ou nao podera sair d Auto Shopping.   





