# 🤝Tamo-junto

__descrição__
Tamo junto é uma plataforma de crowdFunding que tem como objetivo facilitar investimentos iniciais em projetos
e disponibilizar uma plataforma limpa e live de taixas exorbitantes como outras plataformas

## Objetivo do projeto
O principal objetivo do projeto é ser um projeto de estudos onde eu testo novas estruturas de projetos e novas ferramentas. No caso desse projeto estou testando a arquitetura de projeto EDA juntamente com uma nova gama de bibliotecas e frameworks de messageria como o rabbitmq por exemplo, Também estou melhorando os meus conhecimentos basicos de api como tokens de autenticação no fastify usando jtw e validação de parametros usando o zod, e por fim estou aprofundando meus conhecimentos no gateway de pagamentos Stripe aplicando uma logica complexa de pagamentos com taxas de aplicacao e repasse.
Em um futuro proximo desejo realmente realizar o deploy desse projeto para o publico dos estados unidos assim o meu faaturamento ira ser um pouco maior com o valor do dolar e as taixas serao tao baixas que provavelmente algumas pessoas usem o a api alem do intuito de aprendizagem eu tambem quero que esse seja o meu maior projeto lancado e funcionando atualmente.

## Requisitos
Requisitos sao a parte mais fundamental de um sistema no meu caso ainda ha muitas duvidas perante os requisitos de como as coisas tem que funcionar para que o resultado seja o melhor possivel.

### Funcionais
- [✅] Usuário pode criar uma campanha
- [✅] Usuário pode colocar marcos nessas campanhas
- [✅] Outro usuário pode doar para uma campanha
- [✅] Quando atingir um marco um usuário elegível pode receber um premio do marco
- [✅] O criador da campanha devera receber o valor de repasse com uma pequena taxa
- [✅] O criador da campanha podera criar 1 ou mais premios para um marco em especifico
- [✅] O criador da campanha podera configurar um valor minimo de doacao para atingir um marco
- [  ] O criador da campanha tera acesso a informacoes como endereco e email de usuarios que completaram um marco a fim de tornar o envio dos premios de forma mais facil
- [  ] O Sistema devera gerar uma etiqueta de envio para cada usuario que tenha completado um marco e que o premio seja fisicamente enviado

### Não Funcionais
- [✅] O projeto deve ser feito em typescript
- [✅] O projeto tem que seguir com a arquitetura EDA

### Regras de negocio
- [✅] Usuário nao podera doar mais do que o objetivo da campanha
- [✅] O usuario nao recebera o premio do marco se a soma de todas as suas doacoes excluindo o valor da taxa nao alcancarem o valor minimo do marco
- [ ? ] O valor da soma das doações se torna 0 apos completar um marco.


## Como iniciar o projeto na sua maquina?

### 1. Primeiro faca um clone desse repositorio na sua maquina local
```bash 
git clone https://github.com/retr0lbb/tamo-junto.git
```

### 2. Instale as dependencias do projeto
```bash
npm i
```

### 3. Rode o servidor
```bash
npm run dev
```


## consideracoes finais
esse projeto esta sendo bem desafiador para mim ao mesmo tempo estou aprendendo muito com ele principalmente sobre logicas de pagamento que ate o inicio do projeto eu nao achei que seria tao complexo quanto é esse sistema de pagamento mas esse projeto eu irei completar o deploy principalmente depois de superar a minha preguiça de criar uma conta de pagamentos na google cloud e aprender mais sobre deploy.



