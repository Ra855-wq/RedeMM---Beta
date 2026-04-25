# Arquitetura e Planejamento: Banco de Dados de Usuários (PMMB)

Este documento detalha o planejamento da estrutura de banco de dados (Firestore) para gerenciar os usuários do sistema, especificamente os Médicos Bolsistas do Programa Mais Médicos e os Administradores/Moderadores.

## 1. Estrutura de Coleções (Collections)

Adotaremos uma abordagem baseada em **NoSQL (Firestore)**, que prioriza a leitura rápida e a segurança isolada.

### Coleção Principal: `users`
Esta coleção armazenará os dados principais de perfil profissional e controle de acesso.

**Esquema (Schema) Proposto para o Documento `users/{userId}`:**
*   `id` (String): ID único vinculado ao Firebase Auth (UID).
*   `name` (String): Nome completo do profissional.
*   `username` (String): Identificador interno/email gerado.
*   `email` (String): Email principal de contato.
*   `rmsId` (String): Registro do Ministério da Saúde (Ex: PMMB-12345). Único e imutável pelo médico.
*   `crm` (String): Registro do Conselho Regional (Ex: CRM/ES 123456).
*   `role` (String): Papel no sistema (`'admin'` ou `'doctor'`). Editável *apenas* por administradores.
*   `status` (String): Status operacional (`'pending'`, `'active'`, `'suspended'`). Editável *apenas* por administradores.
*   `allocation` (Map/Objeto): Onde o médico está alocado.
    *   `ubs` (String): Nome da Unidade Básica de Saúde.
    *   `city` (String): Município.
    *   `state` (String): Sigla do Estado (UF).
*   `timestamps` (Map/Objeto):
    *   `createdAt` (Timestamp): Data de criação da conta.
    *   `updatedAt` (Timestamp): Última modificação no perfil.

### Coleção Privada (Opcional para PII): `users/{userId}/private/info`
Para respeitar a LGPD e seguir as boas práticas de segurança (Pilar 6 - Isolamento de PII), dados sensíveis que não devem ser expostos em listagens podem ir para uma subcoleção.
*   `phoneNumber` (String): Telefone pessoal.
*   `cpf` (String): Documento pessoal de identificação.
*   `address` (String): Endereço residencial.

### Subcoleções de Atividade (Relacional)
*   `users/{userId}/consultations`: Lista de consultas ou agendamentos daquele médico.
*   `users/{userId}/messages`: Histórico de interações no assistente lógico (Cérebro Clínico).

---

## 2. Regras de Segurança e Acesso (Firestore Rules)

Para garantir que o planejamento seja **fiel e seguro**, as seguintes regras de segurança (Firebase Security Rules) devem ser implementadas antes da liberação final:

1.  **Regra de Autoedição Limitada:** O médico (`role == 'doctor'`) só pode editar seus *próprios* dados não-críticos (ex: foto de perfil). Ele **nunca** poderá alterar seu próprio `status`, `role` ou `rmsId`.
2.  **Regra do Moderador:** Apenas usuários com um documento válido na coleção `admins` ou cuja `role` já seja consolidada como `admin` podem listar todos os médicos e autorizar (mudar status de `'pending'` para `'active'`).
3.  **Filtragem de Busca (List):** Consultas à lista completa de usuários serão restritas apenas ao perfil 'admin'. Outros médicos só terão acesso à visualização do perfil público caso necessite colaboração intencional.

---

## 3. Passos de Implementação (Roadmap)

Conforme sua solicitação, segue o passo a passo de como vamos construir e integrar isso de forma fidedigna:

*   **Passo 1: Atualização dos Modelos Typescript (`types.ts`)**
    *   Expandir a interface `User` para conter os campos listados na arquitetura acima, garantindo tipagem forte no frontend (React).

*   **Passo 2: Refinamento do Processo de Aprovação (AdminView)**
    *   Atualizar o painel do moderador para não apenas aprovar (`status = 'active'`), mas também preencher ou confirmar a `allocation` (Unidade/Cidade) e o `crm`.

*   **Passo 3: Blindagem do Firebase (firestore.rules)**
    *   Gerar o script rígido de regras de segurança para garantir a integridade dos atributos protegidos (`role`, `status`, `rmsId`).

*   **Passo 4: Atualização da View de Perfil (Credencial)**
    *   O perfil do médico passará a ler os dados dinamicamente do banco de dados (hoje eles têm placeholders visuais) para montar a "Credencial" e a página de "Profile".

## Qual é o próximo passo?

Avalie esta arquitetura proposta. Se os campos, as regras de segurança e o particionamento fizerem sentido e forem *fiéis* às necessidades programáticas da coordenação do PMMB (Mais Médicos), me dê um "Ok, pode seguir", e eu começarei a executar o código passo a passo, começando pelos modelos TypeScript e Regras de Segurança. Tem algum campo extra que gostaria de adicionar? (ex: Supervisor/Tutor do provimento?).
