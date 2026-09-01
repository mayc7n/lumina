# Hardening de segurança do Lumina

Data da revisão: 2026-09-01

Este documento registra achados, correções, buscas e evidências da revisão de segurança. Nenhum valor de segredo, token ou arquivo `.env` foi copiado para este relatório.

## Resultado executivo

- O scan inicial `semgrep --config auto .` encontrou 12 achados bloqueantes.
- O scan aprofundado com `p/secrets`, `p/owasp-top-ten` e `p/security-audit` encontrou 17 ocorrências bloqueantes, concentradas em GitHub Actions e NGINX.
- Os dois scans finais terminaram com 0 achados e 0 bloqueantes em 295 arquivos rastreados.
- O `npm audit` inicial encontrou 9 vulnerabilidades altas; após as atualizações, encontrou 0.
- O OSV-Scanner inicial encontrou 111 registros de vulnerabilidade em 31 pacotes Maven. Após atualizar Spring Boot e transitivos, o scan do SBOM com 126 componentes retornou `No issues found`.
- As migrações V1, V3 e V4 foram aplicadas com sucesso em PostgreSQL 16 temporário.
- O RLS foi testado com uma conta `NOSUPERUSER`: 0 linhas sem contexto, 1 linha do usuário selecionado e 0 linhas de outro usuário.
- A interface, os seeds e as respostas sociais não contêm mais emojis; a renderização usa Lucide e chaves de ícone.

## Achados e correções

| Achado | Risco | Correção |
|---|---|---|
| Actions referenciadas por tags mutáveis | Comprometimento da cadeia de suprimentos | Todas as Actions foram fixadas em SHA de 40 caracteres. |
| Upgrade HTTP repassado livremente no NGINX | H2C smuggling | Apenas o valor `websocket` é aceito e mapeado para upgrade. |
| `add_header` em `location` sobrescrevia headers do servidor | Perda de headers de segurança em assets | Cache de assets passou a usar `expires`, preservando a herança. |
| Uso de `$host` controlável pelo cliente | Host header injection | Redirecionamento e proxy usam o host configurado. |
| Regra H2C não reconhecia a validação explícita do WebSocket | Falso positivo residual | O bloco rejeita upgrade diferente de `websocket`, repassa literais e possui supressão apenas na linha revisada. |
| JWT e refresh token no `localStorage` | Roubo de sessão por XSS | Tokens passaram para cookies `HttpOnly`; o JSON não serializa os tokens. Uma migração única troca e remove sessões antigas. |
| Usuário do JWT não era revalidado | Conta suspensa poderia manter acesso até expirar | O filtro consulta o usuário ativo e atualiza role/e-mail a cada requisição. |
| Rate limit apenas declarado | Brute force e abuso automatizado | Bucket4j aplica 10 req/min nos endpoints de autenticação e 120 req/min na API. |
| Entrada dinâmica por `Map<String,Object>` | Mass assignment e coerção de tipos | DTOs específicos, validação Bean Validation e rejeição de campos desconhecidos. |
| Conta PostgreSQL administrativa usada pela aplicação | RLS ignorado por superusuário | Conta de migração e conta `NOSUPERUSER` foram separadas; bootstrap concede somente DML. |
| Feed social incluía descrição de tarefa | Exposição desnecessária de conteúdo | A resposta pública aos amigos foi reduzida a metadados necessários. |
| Backups em texto compactado | Vazamento de dados em cópias | Backup e restore usam AES-256-CBC com PBKDF2 e passphrase externa. |
| Dependências antigas | CVEs conhecidas | Next.js, Axios, Spring Boot e transitivos foram atualizados e reescaneados. |

## Cobertura dos controles solicitados

- **API keys e secrets:** `.env*` permanece ignorado; a árvore e o histórico foram buscados por formatos de AWS, Google, GitHub, Stripe, chaves privadas e JWT. Nenhum segredo rastreado foi encontrado, portanto não houve motivo para reescrever o histórico. Segredos reais devem ser rotacionados se já tiverem sido publicados fora deste repositório.
- **Chave pública de banco:** não se aplica. O projeto não usa Supabase nem expõe chave de banco ao navegador; o frontend acessa somente a API e o PostgreSQL de produção permanece na rede privada.
- **RLS:** ativado e forçado nas tabelas de dados por usuário. O backend define `lumina.user_id` localmente na transação; políticas indiretas cobrem labels, streaks, milestones, amizades e posts sociais.
- **Criptografia:** HTTPS protege tráfego externo; backups são criptografados. Senhas são hashes BCrypt e refresh tokens persistidos são hashes SHA-256. A criptografia do volume PostgreSQL em repouso continua sendo responsabilidade do host/cloud, pois criptografar campos pesquisáveis dentro da aplicação mudaria consultas e comportamento.
- **Autenticação server-side:** backend revalida usuário ativo; middleware Next protege rotas por cookie e a API é a autoridade final.
- **Restrição de acesso:** banco/cache/mensageria não publicam portas em produção; portas locais estão ligadas a `127.0.0.1`; banco usa role limitada e serviços filtram por usuário.
- **Mass assignment:** removido dos controllers de usuário, hábitos, estudos e social; campos desconhecidos são rejeitados.
- **Cookies:** `HttpOnly`, `Secure` em produção, `SameSite=Strict`, path explícito e expiração alinhada aos JWTs. Requisições mutáveis autenticadas por cookie validam `Origin`. O único uso de `localStorage` restante lê, migra e apaga o formato legado.
- **Senhas:** BCrypt com custo 12; comprimento entre 8 e 128 caracteres nos fluxos existentes.
- **Rate limit e bots:** rate limit de aplicação e de NGINX; respostas 429 têm `Retry-After`. CAPTCHA não foi adicionado porque exigiria fornecedor, chaves e alteração do fluxo de login; o controle atual é independente de terceiros.
- **Queries parametrizadas:** JPQL usa parâmetros e JdbcTemplate usa placeholders. A única seleção de nome de tabela percorre uma allowlist constante interna, sem entrada do usuário.
- **Validação:** limites de tamanho, faixa numérica e formato foram adicionados; JSON desconhecido/malformado retorna erro genérico sem stack trace.
- **Vazamento de conteúdo:** erros de produção não incluem mensagem interna/stack; export não é cacheado; feed social não retorna descrição; DTOs evitam serializar entidades e credenciais.
- **Uploads:** limite global de 2 MB e allowlist cliente para JPEG, PNG e WebP; SVG é recusado. Atualmente não existe handler backend de avatar, portanto nenhum arquivo é persistido sem validação server-side.
- **Respostas da API:** tokens são omitidos do JSON, export usa `no-store` e respostas sociais foram minimizadas.
- **Headers e HTTPS:** CSP, HSTS, frame deny, nosniff, referrer policy, permissions policy, COOP e CORP foram configurados; Caddy obtém certificado e NGINX redireciona HTTP para HTTPS.
- **Dependências:** npm audit, SBOM CycloneDX, OSV-Scanner e OWASP Dependency-Check na CI. Semgrep também roda na CI.
- **Ícones:** emojis foram trocados por componentes Lucide/chaves estáveis, inclusive moods, hábitos, conquistas e feed.

## Buscas e evidências executadas

Comandos principais, sem valores sensíveis:

```text
npx skills add semgrep/skills --skill semgrep -y
python3 -m pip install semgrep                 # recusado por PEP 668
pipx install semgrep --python python3         # Semgrep 1.175.0 isolado
semgrep --config auto .
semgrep --config p/secrets --config p/owasp-top-ten --config p/security-audit .
git rev-list --all + git grep por formatos conhecidos de segredo
rg por localStorage, innerHTML, Map em RequestBody, uploads, SQL, cookies e emojis
npm audit --json
./mvnw -B -ntp test
npm run type-check
npm run lint
npm run build
CycloneDX Maven: SBOM JSON com 126 componentes
OSV-Scanner 2.4.0 fixado no digest sha256:5116601...
PostgreSQL 16 temporário: V1 + V3 + V4 e teste de isolamento RLS
docker compose ... config --quiet
sh -n nos scripts operacionais
git diff --check
```

O primeiro OWASP Dependency-Check local foi interrompido após 3% porque, sem chave NVD, precisava baixar 385.055 registros. O scan foi concluído localmente com OSV sobre SBOM; o Dependency-Check completo permanece na CI e aceita `NVD_API_KEY` para atualização eficiente.

## Requisitos de implantação

1. Em instalação nova, use senhas distintas para `DB_MIGRATION_PASSWORD` e `DB_APP_PASSWORD`.
2. Em volume PostgreSQL já existente, defina `DB_MIGRATION_USERNAME` com o usuário proprietário atual antes do primeiro deploy desta versão; o bootstrap cria/atualiza `DB_APP_USERNAME`.
3. Defina `BACKUP_ENCRYPTION_PASSPHRASE` e guarde uma cópia fora do servidor. Sem ela, os backups `.sql.gz.enc` não podem ser restaurados.
4. Configure criptografia do disco/volume no provedor de infraestrutura. Isso não pode ser imposto pelo Compose sem conhecer o host.
5. Configure `NVD_API_KEY` no GitHub para acelerar o Dependency-Check.
6. Teste a CSP no domínio real caso novos provedores de imagem, analytics ou scripts sejam adicionados.

## Escopo preservado

Os fluxos de cadastro, login, renovação, logout e navegação continuam iguais para o usuário. Mudaram apenas o transporte da sessão, a rejeição de entradas inválidas, a redução de dados não necessários e as barreiras de infraestrutura. Funcionalidades anunciadas anteriormente no README mas sem implementação observável, como OAuth2 e 2FA completos, foram removidas da lista de garantias de segurança para evitar documentação enganosa.
