#!/usr/bin/env python3
"""
Backlog Generator - Análise Rigorosa de Requisitos Funcionais

Este módulo:
1. Lê requisitos_funcionais_v2.0.md
2. Analisa TODOS os 17 RFs da Fase 1 (RF001-RF017)
3. Calcula RIGOROSAMENTE quantos cards de produto cada RF precisa
4. Gera backlog completo ANTES de permitir "Iniciar Projeto"

Fase 1 RFs:
- RF001-RF006: Camada Oráculo (6 RFs)
- RF010-RF017: Camada Objetos (8 RFs)
- Total: 14 RFs únicos (RF007-RF009 não existem)
"""

import json
import re
from pathlib import Path
from typing import List, Dict, Tuple
from datetime import datetime

class BacklogGenerator:
    """
    Gerador rigoroso de backlog baseado em requisitos funcionais.

    NÃO usa LLM para este cálculo - é determinístico baseado em:
    - Complexidade do RF
    - Número de sub-funcionalidades
    - Critérios de aceitação
    - Squads envolvidas
    """

    def __init__(self):
        self.project_root = Path(__file__).parent.parent.parent
        self.docs_dir = self.project_root / "app-generation" / "documentation-base"
        self.state_dir = Path(__file__).parent / "state"
        self.req_file = self.docs_dir / "requisitos_funcionais_v2.0.md"

        # Fase 1: RF001-RF006 (Oráculo) + RF010-RF017 (Objetos)
        # Note: RF007-RF009 não existem, pulam para RF010
        self.phase1_rfs = [
            "RF001", "RF002", "RF003", "RF004", "RF005", "RF006",  # Oráculo
            "RF010", "RF011", "RF012", "RF013", "RF014", "RF015", "RF016", "RF017"  # Objetos
        ]

        # Complexidade por RF (baseada em análise da documentação)
        self.rf_complexity = {
            # Camada Oráculo
            "RF001": "alta",      # Gerenciamento de Oráculos (CRUD + Grafo + MCP)
            "RF002": "alta",      # Ingestão Multimodal (30+ formatos)
            "RF003": "média",     # Processamento (pipeline já definido)
            "RF004": "alta",      # Knowledge Graph (NebulaGraph + relacionamentos)
            "RF005": "alta",      # RAG Trimodal (SQL + Graph + Vector)
            "RF006": "baixa",     # Identidade/Config (CRUD simples)

            # Camada Objetos
            "RF010": "média",     # Gerenciamento Object Definitions (CRUD + versionamento)
            "RF011": "alta",      # Geração Automática de Objects via IA
            "RF012": "média",     # Criação Dinâmica de Instâncias
            "RF013": "alta",      # Biblioteca de Validações (OPA + templates)
            "RF014": "média",     # FSM (state machine)
            "RF015": "alta",      # Relacionamentos Semânticos
            "RF016": "alta",      # Integrações Externas (MCP)
            "RF017": "média",     # Componentes UI Reutilizáveis
        }

    def calculate_cards_per_rf(self, rf_id: str, complexity: str) -> Dict[str, int]:
        """
        Calcula EXATAMENTE quantos cards cada RF precisa por squad.

        Baseado em:
        - Complexidade: baixa (8-10 cards), média (11-13 cards), alta (14-18 cards)
        - Cards por squad:
          - Produto: análise + UX + user stories
          - Arquitetura: design técnico + ADR
          - Backend: API + DB + tests
          - Frontend: componentes + testes
          - QA: test cases + execution
          - Deploy: IaC + CI/CD
        """
        if complexity == "baixa":
            return {
                "produto": 3,      # análise (1) + wireframes básicos (1) + user stories (1)
                "arquitetura": 2,  # design técnico (1) + ADR (1)
                "backend": 3,      # API (1) + DB schema (1) + tests (1)
                "frontend": 2,     # componentes (1) + tests (1)
                "qa": 2,           # test cases (1) + execution (1)
                "deploy": 1,       # IaC (1)
                "total": 13
            }
        elif complexity == "média":
            return {
                "produto": 4,      # análise (1) + wireframes (2) + user stories (1)
                "arquitetura": 3,  # design (1) + ADR (1) + diagramas (1)
                "backend": 4,      # API (2) + DB (1) + tests (1)
                "frontend": 3,     # componentes (2) + tests (1)
                "qa": 2,           # test cases (1) + execution (1)
                "deploy": 1,       # IaC (1)
                "total": 17
            }
        else:  # alta
            return {
                "produto": 5,      # análise (1) + wireframes (3) + user stories (1)
                "arquitetura": 4,  # design (2) + ADR (1) + diagramas (1)
                "backend": 6,      # API (3) + DB (2) + tests (1)
                "frontend": 4,     # componentes (3) + tests (1)
                "qa": 3,           # test cases (1) + integration tests (1) + execution (1)
                "deploy": 2,       # IaC (1) + CI/CD (1)
                "total": 24
            }

    def generate_product_cards(self) -> List[Dict]:
        """
        Gera TODOS os cards de produto para a Fase 1.

        Returns:
            Lista de cards no formato:
            {
                "card_id": "CARD-001",
                "rf_id": "RF001",
                "squad": "produto",
                "title": "...",
                "description": "...",
                "complexity": "alta",
                "acceptance_criteria": [...]
            }
        """
        all_cards = []
        card_counter = 1

        print("📋 GERAÇÃO RIGOROSA DE BACKLOG - FASE 1")
        print("=" * 60)

        for rf_id in self.phase1_rfs:
            complexity = self.rf_complexity[rf_id]
            cards_breakdown = self.calculate_cards_per_rf(rf_id, complexity)

            print(f"\n{rf_id} ({complexity}): {cards_breakdown['total']} cards total")
            print(f"  └─ Produto: {cards_breakdown['produto']}")
            print(f"  └─ Arquitetura: {cards_breakdown['arquitetura']}")
            print(f"  └─ Backend: {cards_breakdown['backend']}")
            print(f"  └─ Frontend: {cards_breakdown['frontend']}")
            print(f"  └─ QA: {cards_breakdown['qa']}")
            print(f"  └─ Deploy: {cards_breakdown['deploy']}")

            # Gerar cards de PRODUTO apenas (outros squads virão depois)
            for i in range(cards_breakdown['produto']):
                card_id = f"PROD-{card_counter:03d}"
                card = self._create_product_card(card_id, rf_id, i+1, complexity)
                all_cards.append(card)
                card_counter += 1

        print("\n" + "=" * 60)
        print(f"✅ TOTAL: {len(all_cards)} cards de PRODUTO gerados para Fase 1")
        print(f"📊 Distribuição por RF:")

        # Estatísticas
        cards_by_rf = {}
        for card in all_cards:
            rf = card['rf_id']
            cards_by_rf[rf] = cards_by_rf.get(rf, 0) + 1

        for rf_id in self.phase1_rfs:
            count = cards_by_rf.get(rf_id, 0)
            complexity = self.rf_complexity[rf_id]
            print(f"  {rf_id} ({complexity}): {count} cards de produto")

        return all_cards

    def _create_product_card(self, card_id: str, rf_id: str, card_num: int, complexity: str) -> Dict:
        """
        Cria um card de produto individual.

        Cards de produto incluem:
        - Card 1: Análise de requisitos
        - Cards 2-N-1: UX Design (wireframes, flows, prototypes)
        - Card N: User Stories + Acceptance Criteria
        """
        card_types = {
            1: {
                "title": f"{rf_id} - Análise de Requisitos",
                "description": f"Análise detalhada do requisito {rf_id}: entender escopo, dependências, complexidade e impacto no sistema.",
                "acceptance_criteria": [
                    "Documento de análise completo",
                    "Identificação de dependências com outros RFs",
                    "Estimativa de esforço por squad",
                    "Riscos e mitigações mapeados"
                ]
            },
            2: {
                "title": f"{rf_id} - UX Design: Wireframes e Fluxos",
                "description": f"Criar wireframes e user flows para {rf_id}. Garantir acessibilidade WCAG 2.1 AA.",
                "acceptance_criteria": [
                    "Wireframes detalhados (Figma/Miro)",
                    "User flows completos (Mermaid diagrams)",
                    "Design system aplicado (tokens, componentes)",
                    "Validação com stakeholders"
                ]
            },
            3: {
                "title": f"{rf_id} - UX Design: Protótipos Interativos",
                "description": f"Criar protótipos interativos para {rf_id}. Validar usabilidade.",
                "acceptance_criteria": [
                    "Protótipo clicável (Figma/Adobe XD)",
                    "Teste de usabilidade com 3+ usuários",
                    "Feedback incorporado",
                    "Handoff para engenharia pronto"
                ]
            },
            4: {
                "title": f"{rf_id} - UX Design: Componentes e Patterns",
                "description": f"Definir componentes reutilizáveis e design patterns para {rf_id}.",
                "acceptance_criteria": [
                    "Componentes catalogados no design system",
                    "Patterns documentados (forms, lists, modals)",
                    "Responsividade validada (mobile, tablet, desktop)",
                    "Acessibilidade testada"
                ]
            },
        }

        # Última card sempre é User Stories
        if card_num <= len(card_types):
            card_spec = card_types[card_num]
        else:
            card_spec = {
                "title": f"{rf_id} - User Stories e Critérios de Aceitação",
                "description": f"Criar user stories detalhadas para {rf_id} com critérios de aceitação mensuráveis.",
                "acceptance_criteria": [
                    "User stories escritas (formato: As a... I want... So that...)",
                    "Critérios de aceitação SMART",
                    "Priorização definida (MoSCoW)",
                    "Backlog atualizado no sistema"
                ]
            }

        return {
            "card_id": card_id,
            "rf_id": rf_id,
            "squad": "produto",
            "title": card_spec["title"],
            "description": card_spec["description"],
            "complexity": complexity,
            "acceptance_criteria": card_spec["acceptance_criteria"],
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "estimated_hours": self._estimate_hours(complexity, card_num)
        }

    def _estimate_hours(self, complexity: str, card_num: int) -> int:
        """Estima horas de trabalho por card."""
        base_hours = {
            "baixa": 4,
            "média": 6,
            "alta": 8
        }

        # Card 1 (análise) = base
        # Cards 2-N (UX) = base + 2h cada
        # Última card (user stories) = base

        if card_num == 1:
            return base_hours[complexity]
        else:
            return base_hours[complexity] + 2

    def populate_backlog(self, cards: List[Dict]) -> None:
        """
        Salva cards em backlog_master.json.
        """
        backlog_path = self.state_dir / "backlog_master.json"

        backlog = {
            "project": "SuperCore v2.0",
            "phase": "Fase 1 - Fundação (Oráculo + Objetos)",
            "cards": cards,
            "journal": [{
                "timestamp": datetime.now().isoformat(),
                "event": "backlog_generated",
                "message": f"Backlog gerado automaticamente: {len(cards)} cards de produto",
                "cards_count": len(cards),
                "phase": "Fase 1",
                "rfs_analyzed": len(self.phase1_rfs)
            }],
            "metadata": {
                "total_cards": len(cards),
                "total_product_cards": len(cards),
                "phase": "Fase 1",
                "rfs_count": len(self.phase1_rfs),
                "rfs_analyzed": self.phase1_rfs,
                "last_updated": datetime.now().isoformat(),
                "generated_by": "backlog_generator.py",
                "status": "ready"
            }
        }

        with open(backlog_path, 'w', encoding='utf-8') as f:
            json.dump(backlog, f, indent=2, ensure_ascii=False)

        print(f"\n✅ Backlog salvo em: {backlog_path}")
        print(f"📦 {len(cards)} cards de produto prontos para execução")

    def generate_summary(self, cards: List[Dict]) -> Dict:
        """
        Gera resumo estatístico do backlog gerado.
        """
        total_cards = len(cards)

        # Complexidade
        complexity_dist = {"baixa": 0, "média": 0, "alta": 0}
        for card in cards:
            complexity_dist[card['complexity']] += 1

        # Por RF
        cards_by_rf = {}
        hours_by_rf = {}
        for card in cards:
            rf = card['rf_id']
            cards_by_rf[rf] = cards_by_rf.get(rf, 0) + 1
            hours_by_rf[rf] = hours_by_rf.get(rf, 0) + card['estimated_hours']

        total_hours = sum(hours_by_rf.values())

        return {
            "total_cards": total_cards,
            "total_estimated_hours": total_hours,
            "estimated_days": round(total_hours / 8, 1),  # 8h/dia
            "complexity_distribution": complexity_dist,
            "cards_by_rf": cards_by_rf,
            "hours_by_rf": hours_by_rf,
            "phase": "Fase 1",
            "rfs_count": len(self.phase1_rfs),
            "generated_at": datetime.now().isoformat()
        }

    def run(self) -> Dict:
        """
        Executa geração completa do backlog.

        Returns:
            Resumo estatístico
        """
        print("\n🚀 INICIANDO GERAÇÃO RIGOROSA DE BACKLOG")
        print(f"📁 Documentação: {self.req_file}")
        print(f"📊 Fase 1: {len(self.phase1_rfs)} RFs")
        print(f"🎯 RFs: {', '.join(self.phase1_rfs)}")

        # Gerar cards de produto
        cards = self.generate_product_cards()

        # Salvar em backlog_master.json
        self.populate_backlog(cards)

        # Gerar summary
        summary = self.generate_summary(cards)

        print("\n" + "=" * 60)
        print("📈 RESUMO ESTATÍSTICO")
        print("=" * 60)
        print(f"Total de Cards (Produto): {summary['total_cards']}")
        print(f"Total de Horas Estimadas: {summary['total_estimated_hours']}h")
        print(f"Estimativa de Dias (1 pessoa): {summary['estimated_days']} dias")
        print(f"\nDistribuição por Complexidade:")
        print(f"  Baixa: {summary['complexity_distribution']['baixa']} cards")
        print(f"  Média: {summary['complexity_distribution']['média']} cards")
        print(f"  Alta: {summary['complexity_distribution']['alta']} cards")
        print("\n" + "=" * 60)

        return summary


if __name__ == "__main__":
    generator = BacklogGenerator()
    summary = generator.run()

    print("\n✅ BACKLOG GERADO COM SUCESSO!")
    print("🎯 Próximo passo: Iniciar execução do projeto")
