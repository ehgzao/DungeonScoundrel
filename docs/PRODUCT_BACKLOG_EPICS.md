# Dungeon Scoundrel – Product Backlog (Epics & User Stories)

_Gerado em: 2025-11-24_

Este documento resume os épicos e user stories do Dungeon Scoundrel.

- Seção 1: backlog reverso (features já implementadas).
- Seção 2: backlog futuro (propostas de evolução, incluindo mobile).

O formato visa ser fácil de:
- copiar/colar para Notion, Jira ou Linear
- converter para CSV (copiando as tabelas para uma planilha)

---

## 1. Backlog reverso – Features já implementadas

### Epic DS-E01 – Core gameplay de cartas e dungeon
_Status: Implementado_

| ID   | Tipo   | Título             | User Story                                                                                                        | Status        |
|------|--------|--------------------|-------------------------------------------------------------------------------------------------------------------|---------------|
| DS-1 | Story  | Iniciar uma run    | Como jogador, eu quero iniciar uma nova run com um baralho de cartas de dungeon, para ter uma experiência única. | Implementado  |
| DS-2 | Story  | Enfrentar monstros | Como jogador, eu quero usar a arma equipada para atacar monstros, para sobreviver às salas da dungeon.           | Implementado  |
| DS-3 | Story  | Sofrer dano        | Como jogador, eu quero que o dano seja calculado pela diferença entre monstro e arma, para entender o risco.     | Implementado  |
| DS-4 | Story  | Usar poções        | Como jogador, eu quero usar poções para recuperar HP, para prolongar minha run.                                  | Implementado  |
| DS-5 | Story  | Usar cartas especiais | Como jogador, eu quero usar cartas especiais com efeitos únicos, para criar estratégias avançadas.             | Implementado  |
| DS-6 | Story  | Evitar sala        | Como jogador, eu quero ter a opção de evitar a sala atual, para controlar melhor o risco da run.                | Implementado  |
| DS-7 | Story  | Descarte visível   | Como jogador, eu quero ver cartas descartadas recentemente, para entender melhor o histórico da run.             | Implementado  |
| DS-8 | Story  | Sistema de combo   | Como jogador, eu quero acumular combo ao matar monstros sem tomar dano, para receber bônus de dano.             | Implementado  |

---

### Epic DS-E02 – Progressão de dungeon, bosses e modos
_Status: Implementado_

| ID    | Tipo  | Título                 | User Story                                                                                                            | Status       |
|-------|-------|------------------------|-----------------------------------------------------------------------------------------------------------------------|--------------|
| DS-20 | Story | Selecionar dificuldade | Como jogador, eu quero escolher a dificuldade (Easy/Normal/Hard), para adequar o desafio ao meu nível.              | Implementado |
| DS-21 | Story | Boss final             | Como jogador, eu quero enfrentar um boss final após progredir na dungeon, para ter sensação clara de vitória.       | Implementado |
| DS-22 | Story | Modo endless           | Como jogador hardcore, eu quero um modo endless com dificuldade crescente, para ver até onde consigo chegar.        | Implementado |
| DS-23 | Story | Regras de undo         | Como jogador, eu quero que o botão de undo exista apenas em modos mais fáceis, para manter o Hard realmente punitivo.| Implementado |

---

### Epic DS-E03 – Relics e efeitos passivos
_Status: Implementado_

| ID    | Tipo  | Título                      | User Story                                                                                                                | Status       |
|-------|-------|-----------------------------|---------------------------------------------------------------------------------------------------------------------------|--------------|
| DS-40 | Story | Ganhar relics por raridade  | Como jogador, eu quero ganhar relics comuns/raras/lendárias, para montar builds diferentes a cada run.                  | Implementado |
| DS-41 | Story | Evitar duplicatas quando possível | Como jogador, eu quero priorizar relics que ainda não tenho, para sentir progresso dentro da run.                    | Implementado |
| DS-42 | Story | UI de relics                | Como jogador, eu quero ver minhas relics com descrição e estado, para entender o impacto delas nas decisões.           | Implementado |
| DS-43 | Story | Efeitos imediatos de relics | Como jogador, eu quero que algumas relics alterem HP/ouro imediatamente, para sentir recompensa instantânea.           | Implementado |
| DS-44 | Story | Relics sinérgicas           | Como jogador, eu quero relics que interajam com a loja, eventos e outras mecânicas, para criar sinergias de build.     | Implementado |

---

### Epic DS-E04 – Shop & economia de ouro
_Status: Implementado_

| ID    | Tipo  | Título                      | User Story                                                                                                                        | Status       |
|-------|-------|-----------------------------|-----------------------------------------------------------------------------------------------------------------------------------|--------------|
| DS-60 | Story | Abrir loja                  | Como jogador, eu quero acessar a loja em momentos específicos da run, para gastar o ouro acumulado em itens estratégicos.       | Implementado |
| DS-61 | Story | Ver itens e preços          | Como jogador, eu quero ver itens com nome, descrição e preço, para avaliar o custo/benefício de cada compra.                    | Implementado |
| DS-62 | Story | Descontos por progressão    | Como jogador, eu quero que unlocks e relics gerem desconto na loja, para sentir impacto da minha progressão de longo prazo.     | Implementado |
| DS-63 | Story | Preços dinâmicos anti-exploit | Como produto, eu quero que o preço aumente após compras repetidas, para evitar exploits e manter o balanceamento.            | Implementado |
| DS-64 | Story | Feedback de compra          | Como jogador, eu quero mensagens claras de sucesso/erro ao comprar, para entender o que aconteceu imediatamente.                | Implementado |
| DS-65 | Story | Tracking de compras         | Como sistema, eu quero registrar visitas à loja e itens comprados, para alimentar achievements e unlocks permanentes.           | Implementado |

---

### Epic DS-E05 – Meta-progression: unlocks permanentes
_Status: Implementado_

| ID    | Tipo  | Título                         | User Story                                                                                                                          | Status       |
|-------|-------|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|--------------|
| DS-80 | Story | Lifetime stats para unlocks    | Como jogo, eu quero acumular estatísticas de vida inteira, para usá-las como requisitos de unlocks permanentes.                    | Implementado |
| DS-81 | Story | Lista de upgrades permanentes  | Como jogador, eu quero ver upgrades como startHealth/godMode/shopDiscount, para ter objetivos de longo prazo.                     | Implementado |
| DS-82 | Story | Checar disponibilidade de upgrade | Como sistema, eu quero checar se o requisito de um upgrade foi atingido, para liberar o botão de desbloqueio.                  | Implementado |
| DS-83 | Story | Aplicar unlocks na run         | Como jogador, eu quero que unlocks ativos impactem HP, ouro, relics e armas no início da run, para construir builds persistentes. | Implementado |
| DS-84 | Story | Toast de upgrade disponível    | Como jogador, eu quero receber notificações quando novos upgrades ficarem disponíveis, para não perder oportunidades.             | Implementado |

---

### Epic DS-E06 – Achievements & Codex
_Status: Implementado_

| ID     | Tipo  | Título                         | User Story                                                                                                                    | Status       |
|--------|-------|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------|--------------|
| DS-100 | Story | Sistema de 50 achievements     | Como jogador, eu quero desbloquear achievements em tiers (bronze/silver/gold/platinum), para ter metas claras de skill.       | Implementado |
| DS-101 | Story | Checagem automática de achiev. | Como sistema, eu quero avaliar estatísticas e marcar achievements como desbloqueados, sem exigir ações manuais do jogador.   | Implementado |
| DS-102 | Story | Codex – aba de upgrades        | Como jogador, eu quero ver todos os upgrades permanentes no Codex, com status locked/available/unlocked.                      | Implementado |
| DS-103 | Story | Codex – aba de relics          | Como jogador, eu quero visualizar um glossário completo de relics com raridade e descrição.                                   | Implementado |
| DS-104 | Story | Codex – aba de achievements    | Como jogador, eu quero ver todos os achievements com indicação do que já desbloqueei.                                         | Implementado |
| DS-105 | Story | Filtros no Codex               | Como jogador avançado, eu quero filtrar upgrades/relics/achievements por status ou tier, para navegar mais rápido.           | Implementado |

---

### Epic DS-E07 – Estatísticas e tracking
_Status: Implementado_

| ID     | Tipo  | Título                         | User Story                                                                                                                          | Status       |
|--------|-------|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|--------------|
| DS-120 | Story | Stats de run                   | Como sistema, eu quero acumular stats da run (roomsCleared, monstersSlain, etc.), para calcular score e atualizar lifetime stats. | Implementado |
| DS-121 | Story | Lifetime stats persistentes    | Como jogador, eu quero que minhas estatísticas globais sejam salvas entre sessões, mesmo sem login.                               | Implementado |
| DS-122 | Story | Atualizar stats ao fim da run  | Como sistema, eu quero consolidar as estatísticas ao término da run (vitória, morte, give up), para manter dados consistentes.   | Implementado |
| DS-123 | Story | Score dinâmico                 | Como jogador, eu quero ver meu score atualizado em tempo real, para acompanhar minha performance.                                 | Implementado |
| DS-124 | Story | Sinalizar novos upgrades       | Como jogador, eu quero ser avisado quando um upgrade se torna elegível, para ser direcionado ao meta-game.                        | Implementado |

---

### Epic DS-E08 – Música, áudio e feedback sensorial
_Status: Implementado_

| ID     | Tipo  | Título                        | User Story                                                                                                                       | Status       |
|--------|-------|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------|--------------|
| DS-140 | Story | Trilha dinâmica por contexto  | Como jogador, eu quero que a música mude entre menu, gameplay, shop, vitória e derrota, para reforçar o clima de cada momento. | Implementado |
| DS-141 | Story | Controle de volume de música  | Como jogador, eu quero controlar o volume da música, para adequar a experiência ao meu gosto.                                  | Implementado |
| DS-142 | Story | Efeitos sonoros de ações      | Como jogador, eu quero ouvir SFX em ações importantes (virar carta, comprar, desbloquear), para ter feedback imediato.         | Implementado |
| DS-143 | Story | Música estável (sem leaks)    | Como produto, eu quero um sistema de música com fade in/out e sem memory leaks, para sessões longas sem bugs de áudio.        | Implementado |

---

### Epic DS-E09 – Onboarding, tutorial e UX de frustração
_Status: Implementado_

| ID     | Tipo  | Título                     | User Story                                                                                                                          | Status       |
|--------|-------|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------|--------------|
| DS-160 | Story | Tutorial interativo        | Como novo jogador, eu quero um tutorial guiado, para aprender rapidamente as regras básicas do jogo.                              | Implementado |
| DS-161 | Story | Achievement de tutorial    | Como sistema, eu quero marcar quando o jogador conclui o tutorial, para registrar esse marco e influenciar outros unlocks.       | Implementado |
| DS-162 | Story | Aviso de HP crítico        | Como jogador, eu quero receber feedback visual quando meu HP estiver crítico, para perceber o risco de morte iminente.           | Implementado |
| DS-163 | Story | Mensagens de "não desista" | Como jogador que morre várias vezes, eu quero mensagens de incentivo especiais, para não abandonar o jogo por frustração.        | Implementado |
| DS-164 | Story | Tooltips e previews        | Como jogador, eu quero tooltips e previews de efeitos nas cartas, para tomar decisões informadas sem decorar tudo.               | Implementado |

---

### Epic DS-E10 – Leaderboard online
_Status: Implementado (dependente de Firebase)_

| ID     | Tipo  | Título                     | User Story                                                                                                                         | Status             |
|--------|-------|----------------------------|------------------------------------------------------------------------------------------------------------------------------------|--------------------|
| DS-180 | Story | Submeter score ao ranking  | Como jogador online, eu quero enviar meu score e dados da run para um leaderboard, para me comparar com outros jogadores.        | Implementado       |
| DS-181 | Story | Leaderboard por dificuldade| Como jogador competitivo, eu quero rankings separados por dificuldade, para competir em contextos justos.                        | Implementado       |
| DS-182 | Story | Top 10 detalhado           | Como jogador, eu quero ver top 10 com nome, score, tempo, combo e ouro, para entender o perfil das melhores runs.               | Implementado       |
| DS-183 | Story | Mensagem de modo offline   | Como jogador offline, eu quero uma mensagem clara de indisponibilidade do leaderboard, para entender que meu progresso é local. | Implementado       |

---

### Epic DS-E11 – Autenticação, cloud sync e perfil
_Status: Implementado_

| ID     | Tipo  | Título                     | User Story                                                                                                                               | Status       |
|--------|-------|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| DS-200 | Story | Login com Google           | Como jogador, eu quero fazer login com a minha conta Google, para associar meu progresso a um perfil.                                   | Implementado |
| DS-201 | Story | Salvar progresso na nuvem  | Como jogador logado, eu quero salvar estatísticas, unlocks e achievements na nuvem, para não perder progresso ao trocar de dispositivo.| Implementado |
| DS-202 | Story | Carregar progresso da nuvem| Como jogador logado em outro dispositivo, eu quero resgatar o progresso da nuvem, para continuar de onde parei.                        | Implementado |
| DS-203 | Story | UI de status de cloud sync | Como jogador, eu quero um indicador de Cloud Sync mostrando se estou logado e sincronizado, para confiar que meu progresso está seguro.| Implementado |
| DS-204 | Story | Funcionar offline           | Como jogador, eu quero que o jogo continue jogável mesmo se Firebase falhar, para não depender 100% da conexão.                        | Implementado |

---

### Epic DS-E12 – Offline-first, saves locais e backup
_Status: Implementado_

| ID     | Tipo  | Título                      | User Story                                                                                                                           | Status       |
|--------|-------|-----------------------------|--------------------------------------------------------------------------------------------------------------------------------------|--------------|
| DS-220 | Story | Armazenamento robusto       | Como produto, eu quero usar IndexedDB com fallback para localStorage, para garantir persistência em diferentes ambientes.           | Implementado |
| DS-221 | Story | Save de jogo atual          | Como jogador, eu quero que o estado da run possa ser salvo localmente, para retomar em outra sessão (respeitando regras de design).| Implementado |
| DS-222 | Story | Salvar/carregar stats globais| Como jogador, eu quero que minhas estatísticas sejam persistidas localmente mesmo sem login, para manter histórico.                | Implementado |
| DS-223 | Story | Exportar/importar backup    | Como jogador avançado, eu quero exportar/importar meus dados, para migrar entre navegadores/dispositivos manualmente.              | Implementado |

---

### Epic DS-E13 – Mobile-friendly e otimizações
_Status: Parcialmente implementado (web mobile)_

| ID     | Tipo  | Título                           | User Story                                                                                                             | Status               |
|--------|-------|----------------------------------|------------------------------------------------------------------------------------------------------------------------|----------------------|
| DS-240 | Story | Detecção de orientação/layout    | Como jogador mobile, eu quero que o jogo detecte a orientação e ajuste a UI, para manter a jogabilidade confortável. | Parcialmente impl.   |
| DS-241 | Story | Haptic feedback em ações chave   | Como jogador mobile, eu quero vibração/haptic feedback em ações importantes, para uma experiência mais tátil.        | Parcialmente impl.   |
| DS-242 | Story | Ajustes de UI para toque         | Como jogador mobile, eu quero botões e interações otimizados para toque, para reduzir cliques errados.               | Parcialmente impl.   |

---

### Epic DS-E14 – Bug reports, suporte e incidentes críticos
_Status: Implementado_

| ID     | Tipo  | Título                          | User Story                                                                                                                         | Status       |
|--------|-------|---------------------------------|------------------------------------------------------------------------------------------------------------------------------------|--------------|
| DS-260 | Story | Modal de bug report             | Como jogador, eu quero abrir um modal para relatar bugs, para ajudar o desenvolvedor a melhorar o jogo.                           | Implementado |
| DS-261 | Story | Envio via EmailJS               | Como produto, eu quero enviar bug reports via EmailJS com metadata (browser, tela, versão), para facilitar debug.                | Implementado |
| DS-262 | Bug   | Cloud Save falha (loadUnlocks)  | Como jogador logado, eu quero que o Cloud Save funcione sem erros de referência (ex: loadUnlocks is not defined), para confiar no salvamento na nuvem. | URGENTE |

---

## 2. Backlog futuro – Propostas de evolução

> Os épicos abaixo são propostos (planejamento/ideias), não necessariamente comprometidos.

### Epic F1 – Versão mobile-first (web + builds mobile)
_Status proposto: Planejado_

| ID    | Tipo  | Título                        | User Story                                                                                                                        | Status    |
|-------|-------|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|-----------|
| F1-1  | Story | Layout totalmente responsivo  | Como jogador mobile, eu quero uma UI dedicada para telas pequenas, para jogar confortavelmente em smartphones.                  | Proposta  |
| F1-2  | Story | Controles otimizados para toque| Como jogador mobile, eu quero interações pensadas para toque (gestos, áreas maiores), para reduzir erros de input.             | Proposta  |
| F1-3  | Story | Performance mobile            | Como produto, eu quero otimizar animações, áudio e uso de memória em mobile, para garantir FPS adequado em aparelhos médios.   | Proposta  |
| F1-4  | Story | Paridade desktop vs mobile    | Como jogador, eu quero que todas as features do desktop funcionem no mobile, para não sentir uma "versão menor" do jogo.      | Proposta  |

---

### Epic F2 – Expansão de conteúdo (classes, relics, bosses, eventos)
_Status proposto: Planejado_

| ID    | Tipo  | Título                   | User Story                                                                                                                             | Status    |
|-------|-------|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------|-----------|
| F2-1  | Story | Novas classes jogáveis   | Como jogador, eu quero novas classes com passivas e habilidades únicas, para mudar drasticamente meu estilo de jogo.               | Proposta  |
| F2-2  | Story | Pacotes extras de relics | Como jogador, eu quero novos conjuntos de relics com sinergias inéditas, para criar builds ainda mais variadas.                    | Proposta  |
| F2-3  | Story | Novos bosses             | Como jogador avançado, eu quero bosses adicionais com mecânicas diferenciadas, para manter o desafio mesmo dominando o jogo atual.| Proposta  |
| F2-4  | Story | Novos eventos narrativos | Como jogador, eu quero mais eventos de escolha com risco/recompensa, para enriquecer a narrativa emergente das runs.              | Proposta  |

---

### Epic F3 – Desafios diários/semanais e live-ops leves
_Status proposto: Ideia_

| ID    | Tipo  | Título                    | User Story                                                                                                              | Status   |
|-------|-------|---------------------------|-------------------------------------------------------------------------------------------------------------------------|----------|
| F3-1  | Story | Desafios diários          | Como jogador, eu quero desafios diários com modificadores especiais, para ter motivos novos para jogar todo dia.      | Ideia    |
| F3-2  | Story | Desafios semanais com rank| Como jogador competitivo, eu quero desafios semanais com leaderboard próprio, para competir em "temporadas" curtas. | Ideia    |
| F3-3  | Story | Recompensas cosméticas    | Como jogador, eu quero ganhar recompensas cosméticas ou XP de conta ao completar desafios, para ter progressão meta.  | Ideia    |

---

### Epic F4 – Social & compartilhamento
_Status proposto: Ideia_

| ID    | Tipo  | Título                      | User Story                                                                                                                         | Status   |
|-------|-------|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------|----------|
| F4-1  | Story | Compartilhamento de runs    | Como jogador, eu quero compartilhar um link/seed da minha run com amigos, para que eles tentem bater minha marca.                | Ideia    |
| F4-2  | Story | Perfis públicos simples     | Como jogador, eu quero um perfil público básico (stats-chave, melhores scores), para mostrar meu progresso a outras pessoas.    | Ideia    |
| F4-3  | Story | Compartilhar em redes sociais| Como jogador, eu quero compartilhar vitórias/scores em redes sociais, para celebrar conquistas e atrair novos jogadores.        | Ideia    |

---

### Epic F5 – UX avançada, acessibilidade e qualidade de vida
_Status proposto: Planejado_

| ID    | Tipo  | Título                       | User Story                                                                                                                          | Status    |
|-------|-------|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|-----------|
| F5-1  | Story | Opções de acessibilidade     | Como jogador com necessidades específicas, eu quero opções como modo daltônico e fontes maiores, para jogar confortavelmente.    | Proposta  |
| F5-2  | Story | Controles avançados de áudio | Como jogador, eu quero controlar separadamente música, SFX e intensidade de haptics, para personalizar a experiência sensorial.  | Proposta  |
| F5-3  | Story | Melhor feedback de erros     | Como jogador, eu quero mensagens de erro/offline mais claras (Firebase, storage, etc.), para entender rapidamente o problema.    | Proposta  |
| F5-4  | Story | Histórico de runs            | Como jogador engajado, eu quero ver um histórico das minhas últimas runs (score, dificuldade, relics), para acompanhar evolução. | Proposta  |

---

### Epic F6 – Ferramentas de balanceamento e analytics internas
_Status proposto: Ideia_

| ID    | Tipo  | Título                       | User Story                                                                                                                              | Status   |
|-------|-------|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|----------|
| F6-1  | Story | Telemetria agregada de runs  | Como time de produto, eu quero estatísticas agregadas de runs (taxa de vitória, uso de relics), para tomar decisões de balanceamento.| Ideia    |
| F6-2  | Story | Painel interno simples       | Como desenvolvedor/produto, eu quero um painel interno simples com métricas chave, para acompanhar a saúde do jogo.                 | Ideia    |
| F6-3  | Story | Flags para experimentos leves| Como produto, eu quero ativar pequenas variações de balanceamento por grupo de jogadores, para testar hipóteses de design.         | Ideia    |

---

_Fim do documento._
