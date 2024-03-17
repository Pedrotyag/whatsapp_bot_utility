# WhatsApp Bot Utility

Este projeto oferece uma utilidade abrangente para interação automatizada com o WhatsApp, facilitando a verificação de números, a manipulação de mensagens, e a integração com banco de dados para uma gestão eficiente dos dados coletados.

## Características

- **Verificação de Números**: Checa se os números estão registrados no WhatsApp e cataloga como válidos ou inválidos.
- **Gestão de Dados**: Integração com PostgreSQL para armazenamento e gerenciamento dos números verificados, incluindo funções para inserção, atualização, e exportação de dados.
- **Automatização de Tarefas**: Permite o envio automático de mensagens e a criação de backups do banco de dados.
- **Flexibilidade**: Distribui tarefas de validação entre múltiplos bots para otimização do processo.

## Pré-requisitos

- Node.js instalado em sua máquina.
- PostgreSQL instalado e configurado.

## Configuração Inicial

1. Clone o repositório:
    ```bash
    git clone https://github.com/Pedrotyag/whatsapp_bot_utility.git
    ```

2. Instale as dependências:
    ```bash
    cd whatsapp_bot_utility
    npm install
    ```

3. Configure as variáveis de ambiente conforme o exemplo em `.env.example`. Renomeie esse arquivo para `.env` e ajuste os valores conforme sua configuração de PostgreSQL:
    ```
    PGUSER=SEU_USUARIO
    PGPASSWORD=SUA_SENHA
    PGDATABASE=phone_validation
    PGHOST=localhost
    PGPORT=5432
    ```

4. Crie o banco de dados e a tabela executando:
    ```bash
    node db/setup_db.js
    ```

5. Para adicionar números ao banco de dados, coloque-os no arquivo `data/toImport.csv` e execute o script para importação:
    ```bash
    node db/addToDatabaseFromCSV.js
    ```

## Iniciando o Bot

Após a configuração inicial e importação dos números, você pode iniciar o bot com:

```bash
npm start
```

Solução para Problemas com o Chromium
Se encontrar erros relacionados à falta do Chromium, execute o seguinte comando para instalar o Chromium manualmente:

```bash
node node_modules/puppeteer/install.js
```

Isso garantirá que o Puppeteer tenha o Chromium necessário para funcionar corretamente.
