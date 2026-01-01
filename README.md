# Desafio Técnico — GoBots

Este projeto implementa um fluxo simples de marketplace utilizando duas APIs que se comunicam via webhook.

- **Marketplace API**: responsável por criar pedidos, atualizar status e disparar eventos.
- **Receiver API**: recebe eventos via webhook, consulta os dados do pedido na Marketplace API e persiste as informações recebidas, garantindo idempotência.

Todo o ambiente é executado via Docker.

---

## Variáveis de ambiente

Cada serviço requer um arquivo `.env` com as variáveis de configuração. **Os arquivos devem ser criados antes de executar o comando `docker compose up --build`.**

Cada serviço possui seu próprio arquivo `.env`, localizado na raiz de sua respectiva pasta.

### Marketplace API

Crie o arquivo `marketplace-api/.env`:

```env
MONGO_URI=mongodb://mongo:27017/marketplace
```

| Variável    | Descrição                                  |
| ----------- | ------------------------------------------ |
| `MONGO_URI` | URI de conexão com o banco de dados MongoDB |

### Receiver API

Crie o arquivo `receiver-api/.env`:

```env
MONGO_URI=mongodb://mongo:27017/receiver
MARKETPLACE_BASE_URL=http://marketplace-api:3000
```

| Variável               | Descrição                                        |
| ---------------------- | ------------------------------------------------ |
| `MONGO_URI`            | URI de conexão com o banco de dados MongoDB       |
| `MARKETPLACE_BASE_URL` | URL base da Marketplace API para consulta de pedidos |

> **Nota:** Os hostnames `mongo` e `marketplace-api` referem-se aos nomes dos serviços definidos no `docker-compose.yml`, utilizados para comunicação na rede interna do Docker.

---

## Como subir o projeto

Na raiz do repositório, execute o comando abaixo:

```bash
docker compose up --build
```

Após a inicialização dos containers, os serviços estarão disponíveis nos seguintes endereços:

| Serviço         | URL                   |
| --------------- | --------------------- |
| Marketplace API | http://localhost:3000 |
| Receiver API    | http://localhost:3001 |

---

## Como cadastrar um webhook

O webhook deve ser cadastrado na Marketplace API **antes** de criar pedidos. Ele define quais lojas (`storeIds`) terão eventos enviados para a URL de callback especificada.

**Exemplo de cadastro via curl:**

```bash
curl -X POST http://localhost:3000/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "storeIds": ["store_001"],
    "callbackUrl": "http://receiver-api:3001/webhook/orders"
  }'
```

> ⚠️ **Importante:** O webhook **deve** ser cadastrado exatamente no formato acima, utilizando o hostname `receiver-api` na `callbackUrl`. Esse hostname corresponde ao nome do serviço definido no `docker-compose.yml` e é necessário para a comunicação na rede interna do Docker.

---

## Como criar um pedido

Para criar um pedido, execute a chamada abaixo na Marketplace API:

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "store_001"
  }'
```

Ao criar o pedido:

- O status inicial será `CREATED`
- Um evento `order.created` será disparado automaticamente para o Receiver API

> ⚠️ **Importante:** O `storeId` informado na criação do pedido **precisa estar previamente cadastrado** em um webhook. Caso contrário, o evento não será disparado para nenhum receptor.

> 💡 **Dica:** Sempre cadastre o webhook primeiro, incluindo o `storeId` desejado no array `storeIds`, e só depois crie pedidos para essa loja.

---

## Como atualizar o status de um pedido

Para atualizar o status de um pedido existente, execute:

```bash
curl -X PATCH http://localhost:3000/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PAID"
  }'
```

A Marketplace API valida as transições de status e rejeita alterações inválidas, retornando erro HTTP 400 quando a transição não é permitida.

---

## Como validar o resultado no Receiver

### Validação via banco de dados (MongoDB)

Acesse o container do MongoDB:

```bash
docker exec -it mongo mongosh
```

Selecione o banco de dados do Receiver e liste os eventos persistidos:

```javascript
use receiver
db.orderevents.find().pretty()
```

Cada documento salvo contém:

- O evento recebido via webhook
- O identificador do evento (`eventId`)
- O snapshot completo do pedido consultado na Marketplace API

### Validação via logs do container

Também é possível validar o processamento dos eventos pelos logs do Receiver API:

```bash
docker logs receiver-api
```

Os logs indicam o recebimento, validação de idempotência e persistência dos eventos.

---

## Testes

### Marketplace API

Os testes unitários estão implementados apenas na **Marketplace API**, pois é onde estão concentradas as principais regras de negócio do sistema:

- Criação e gerenciamento de pedidos
- Validação de transições de status (máquina de estados)
- Disparo de eventos para webhooks cadastrados

Para executar os testes, acesse o diretório do serviço e execute o comando:

```bash
cd marketplace-api
npm run test
```

---

## Observações finais

- O Receiver API é **idempotente**: eventos com o mesmo `eventId` não são processados mais de uma vez.
- O endpoint de recebimento de webhook retorna sucesso mesmo para eventos duplicados, evitando retries desnecessários.
- A Marketplace API possui validação de transição de status baseada em uma máquina de estados.
- O retry de envio de eventos é tratado na Marketplace API em caso de falha de comunicação com o Receiver.
