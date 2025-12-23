# MCP Implementation Guide - SuperCore

**Status**: 🟡 Em Revisão
**Versão**: 1.0.0
**Data**: 2025-12-11
**Público-Alvo**: Time de Desenvolvimento

---

## 📚 Pré-Requisitos

Antes de começar a implementação do MCP Server, leia:

1. **[SUPERCORE_MCP_SERVER.md](SUPERCORE_MCP_SERVER.md)** - ⭐⭐⭐ Especificação completa
2. **[Model Context Protocol Docs](https://modelcontextprotocol.io/docs)** - Documentação oficial
3. **[docs/fases/fase1/01_especificacoes.md](docs/fases/fase1/01_especificacoes.md)** - Contexto da Fase 1

---

## 1. Setup Inicial

### 1.1 Estrutura de Pastas

```bash
# Criar estrutura do MCP Server
mkdir -p mcp_server/{resources,tools,prompts,tests}
cd mcp_server

# Criar arquivos base
touch __init__.py main.py requirements.txt pyproject.toml README.md
touch resources/__init__.py tools/__init__.py prompts/__init__.py tests/__init__.py
```

**Estrutura esperada**:
```
mcp_server/
├── __init__.py
├── main.py                  # Entry point do MCP Server
├── requirements.txt         # Dependências Python
├── pyproject.toml           # Config Poetry
├── README.md               # Documentação
├── resources/
│   ├── __init__.py
│   ├── oracle.py           # Resource: oracle://config
│   ├── instances.py        # Resource: instances://{type}
│   └── object_defs.py      # Resource: object-definitions://all
├── tools/
│   ├── __init__.py
│   ├── context.py          # Tools: create_context, process_context
│   └── rag.py              # Tool: rag_query
├── prompts/
│   ├── __init__.py
│   ├── bacen.py            # Prompts BACEN
│   └── diagrams.py         # Prompts diagramas
└── tests/
    ├── __init__.py
    ├── test_resources.py
    └── test_tools.py
```

---

### 1.2 Dependências (requirements.txt)

```txt
# MCP Server para SuperCore
# Data: 2025-12-11

# MCP SDK Oficial
mcp>=0.1.0

# HTTP Client
httpx>=0.25.0
aiohttp>=3.9.0

# JSON Schema Validation
jsonschema>=4.20.0

# Logging
structlog>=23.2.0

# Testing
pytest>=7.4.0
pytest-asyncio>=0.21.0
pytest-httpx>=0.26.0

# Type Checking
mypy>=1.7.0

# Linting
ruff>=0.1.6
black>=23.11.0
```

---

### 1.3 Poetry Configuration (pyproject.toml)

```toml
[tool.poetry]
name = "supercore-mcp-server"
version = "1.0.0"
description = "MCP Server para SuperCore - Expõe recursos e ferramentas via Model Context Protocol"
authors = ["SuperCore Team"]
readme = "README.md"
python = "^3.11"

[tool.poetry.dependencies]
python = "^3.11"
mcp = "^0.1.0"
httpx = "^0.25.0"
aiohttp = "^3.9.0"
jsonschema = "^4.20.0"
structlog = "^23.2.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
pytest-asyncio = "^0.21.0"
pytest-httpx = "^0.26.0"
mypy = "^1.7.0"
ruff = "^0.1.6"
black = "^23.11.0"

[tool.poetry.scripts]
mcp-server = "mcp_server.main:main"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

---

### 1.4 Instalação

```bash
# Usando Poetry (recomendado)
poetry install

# Ou usando pip
pip install -r requirements.txt
```

---

## 2. Implementação Passo a Passo

### 2.1 Entry Point (main.py)

```python
# mcp_server/main.py
"""
SuperCore MCP Server

Entry point do MCP Server que expõe recursos e ferramentas do SuperCore
para LLMs via Model Context Protocol.
"""

import asyncio
import os
from mcp import Server
from mcp.types import ServerCapabilities, Implementation
import structlog

# Imports de resources, tools, prompts
from .resources.oracle import register_oracle_resources
from .resources.instances import register_instance_resources
from .resources.object_defs import register_object_def_resources
from .tools.context import register_context_tools
from .tools.rag import register_rag_tools
from .prompts.bacen import register_bacen_prompts

# Logger estruturado
logger = structlog.get_logger()

# Configuração do backend SuperCore
SUPERCORE_API_BASE = os.getenv("SUPERCORE_API_BASE", "http://localhost:8080/api/v1")


async def main():
    """Inicializa e roda o MCP Server"""

    # Cria instância do servidor MCP
    server = Server(
        name="supercore-mcp",
        version="1.0.0",
        implementation=Implementation(
            name="supercore-mcp-server",
            version="1.0.0"
        ),
        capabilities=ServerCapabilities(
            resources=True,   # Expõe Resources
            tools=True,       # Expõe Tools
            prompts=True      # Expõe Prompts
        )
    )

    logger.info(
        "Inicializando SuperCore MCP Server",
        backend_url=SUPERCORE_API_BASE
    )

    # Registra Resources
    await register_oracle_resources(server, SUPERCORE_API_BASE)
    await register_instance_resources(server, SUPERCORE_API_BASE)
    await register_object_def_resources(server, SUPERCORE_API_BASE)

    # Registra Tools
    await register_context_tools(server, SUPERCORE_API_BASE)
    await register_rag_tools(server, SUPERCORE_API_BASE)

    # Registra Prompts
    await register_bacen_prompts(server)

    logger.info("SuperCore MCP Server pronto", resources_count=len(server.resources))

    # Roda servidor via stdio (padrão MCP)
    await server.run()


if __name__ == "__main__":
    asyncio.run(main())
```

---

### 2.2 Resource: oracle://config

```python
# mcp_server/resources/oracle.py
"""Resources relacionados ao Oráculo do SuperCore"""

import httpx
from mcp import Server
from mcp.types import Resource, TextContent
import structlog

logger = structlog.get_logger()


async def register_oracle_resources(server: Server, api_base: str):
    """Registra resources do Oráculo"""

    @server.list_resources()
    async def list_oracle_resources():
        """Lista resources disponíveis do Oráculo"""
        return [
            Resource(
                uri="oracle://config",
                name="Oracle Configuration",
                description="Configuração completa do Oráculo (identidade, licenças, integrações, políticas)",
                mimeType="application/json"
            )
        ]

    @server.read_resource()
    async def read_oracle_config(uri: str) -> str:
        """Lê configuração do Oráculo"""
        if uri != "oracle://config":
            raise ValueError(f"URI inválida: {uri}")

        async with httpx.AsyncClient() as client:
            response = await client.get(f"{api_base}/oracle/whoami")
            response.raise_for_status()

            logger.info("Oracle config consultado via MCP", status=response.status_code)

            return response.text
```

---

### 2.3 Resource: instances://{object_type}

```python
# mcp_server/resources/instances.py
"""Resources relacionados a instances do SuperCore"""

import httpx
from mcp import Server
from mcp.types import Resource
import structlog

logger = structlog.get_logger()


async def register_instance_resources(server: Server, api_base: str):
    """Registra resources de instances"""

    @server.list_resources()
    async def list_instance_resources():
        """Lista resources de instances disponíveis"""
        # Busca todos os object_definitions para criar URIs dinâmicos
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{api_base}/object-definitions")
            response.raise_for_status()
            object_defs = response.json()

        return [
            Resource(
                uri=f"instances://{obj_def['name']}",
                name=f"Instances of {obj_def['display_name']}",
                description=f"Lista de instances do tipo {obj_def['name']}",
                mimeType="application/json"
            )
            for obj_def in object_defs.get("items", [])
        ]

    @server.read_resource()
    async def read_instances(uri: str, filters: dict = None) -> str:
        """Lê instances de um object_definition"""
        if not uri.startswith("instances://"):
            raise ValueError(f"URI inválida: {uri}")

        object_type = uri.replace("instances://", "")

        params = {"object_definition_name": object_type}
        if filters:
            # Converte filtros para query params
            for key, value in filters.items():
                params[f"filters[{key}]"] = value

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{api_base}/instances",
                params=params
            )
            response.raise_for_status()

            logger.info(
                "Instances consultados via MCP",
                object_type=object_type,
                filters=filters,
                count=response.json().get("total", 0)
            )

            return response.text
```

---

### 2.4 Tool: create_context

```python
# mcp_server/tools/context.py
"""Tools relacionados a contextos do SuperCore"""

import httpx
from mcp import Server
from mcp.types import Tool, ToolParameter
import structlog

logger = structlog.get_logger()


async def register_context_tools(server: Server, api_base: str):
    """Registra tools de contexto"""

    @server.list_tools()
    async def list_context_tools():
        """Lista tools de contexto disponíveis"""
        return [
            Tool(
                name="create_context",
                description="Cria um novo contexto de upload",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "super_prompt": {
                            "type": "string",
                            "description": "Super prompt descrevendo a solução desejada (min 100 chars)"
                        },
                        "name": {
                            "type": "string",
                            "description": "Nome descritivo do contexto (opcional)"
                        },
                        "description": {
                            "type": "string",
                            "description": "Descrição detalhada (opcional)"
                        },
                        "tags": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Tags para categorização"
                        }
                    },
                    "required": ["super_prompt"]
                }
            ),
            Tool(
                name="process_context",
                description="Aciona processamento de um contexto",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "context_id": {
                            "type": "string",
                            "description": "ID do contexto a ser processado"
                        }
                    },
                    "required": ["context_id"]
                }
            ),
            Tool(
                name="wait_for_processing",
                description="Aguarda conclusão do processamento (polling interno)",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "context_id": {
                            "type": "string",
                            "description": "ID do contexto sendo processado"
                        },
                        "timeout_seconds": {
                            "type": "integer",
                            "default": 300,
                            "description": "Timeout máximo de espera (padrão: 5 minutos)"
                        }
                    },
                    "required": ["context_id"]
                }
            )
        ]

    @server.call_tool()
    async def create_context(
        super_prompt: str,
        name: str = None,
        description: str = None,
        tags: list[str] = None
    ) -> dict:
        """Cria novo contexto"""
        if len(super_prompt) < 100:
            raise ValueError("Super prompt deve ter no mínimo 100 caracteres")

        payload = {
            "super_prompt": super_prompt,
            "name": name,
            "description": description,
            "tags": tags or []
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{api_base}/context/upload",
                json=payload
            )
            response.raise_for_status()

            result = response.json()

            logger.info(
                "Contexto criado via MCP",
                context_id=result["id"],
                name=result.get("name")
            )

            return result

    @server.call_tool()
    async def process_context(context_id: str) -> dict:
        """Aciona processamento de contexto"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{api_base}/context/{context_id}/process"
            )
            response.raise_for_status()

            result = response.json()

            logger.info(
                "Processamento iniciado via MCP",
                context_id=context_id,
                job_id=result.get("job_id")
            )

            return result

    @server.call_tool()
    async def wait_for_processing(
        context_id: str,
        timeout_seconds: int = 300
    ) -> dict:
        """Aguarda processamento concluir"""
        import asyncio
        import time

        start_time = time.time()

        async with httpx.AsyncClient() as client:
            while True:
                response = await client.get(
                    f"{api_base}/context/{context_id}/status"
                )
                response.raise_for_status()
                status_data = response.json()

                if status_data["status"] in ["SUCESSO", "ERRO"]:
                    logger.info(
                        "Processamento concluído via MCP",
                        context_id=context_id,
                        status=status_data["status"],
                        duration=time.time() - start_time
                    )

                    return {
                        "status": status_data["status"],
                        "processing_duration_seconds": time.time() - start_time,
                        "result_summary": status_data.get("result_summary", {})
                    }

                if time.time() - start_time > timeout_seconds:
                    raise TimeoutError(
                        f"Processamento excedeu timeout de {timeout_seconds}s"
                    )

                await asyncio.sleep(2)  # Poll a cada 2 segundos
```

---

### 2.5 Tool: rag_query

```python
# mcp_server/tools/rag.py
"""Tools relacionados ao RAG do SuperCore"""

import httpx
from mcp import Server
from mcp.types import Tool
import structlog

logger = structlog.get_logger()


async def register_rag_tools(server: Server, api_base: str):
    """Registra tools de RAG"""

    @server.list_tools()
    async def list_rag_tools():
        """Lista tools de RAG disponíveis"""
        return [
            Tool(
                name="rag_query",
                description="Consulta RAG trimodal (SQL + Graph + Vector)",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "question": {
                            "type": "string",
                            "description": "Pergunta em linguagem natural"
                        },
                        "context_filters": {
                            "type": "object",
                            "description": "Filtros para contexto",
                            "properties": {
                                "object_types": {
                                    "type": "array",
                                    "items": {"type": "string"}
                                },
                                "states": {
                                    "type": "array",
                                    "items": {"type": "string"}
                                }
                            }
                        }
                    },
                    "required": ["question"]
                }
            )
        ]

    @server.call_tool()
    async def rag_query(
        question: str,
        context_filters: dict = None
    ) -> dict:
        """Executa query no RAG"""
        payload = {
            "question": question,
            "filters": context_filters or {}
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{api_base}/rag/query",
                json=payload
            )
            response.raise_for_status()

            result = response.json()

            logger.info(
                "RAG query executado via MCP",
                question=question,
                sources_count=len(result.get("sources", []))
            )

            return result
```

---

### 2.6 Prompt: process-bacen-circular

```python
# mcp_server/prompts/bacen.py
"""Prompts para processamento de documentos BACEN"""

from mcp import Server
from mcp.types import Prompt, PromptMessage
import structlog

logger = structlog.get_logger()


async def register_bacen_prompts(server: Server):
    """Registra prompts BACEN"""

    @server.list_prompts()
    async def list_bacen_prompts():
        """Lista prompts BACEN disponíveis"""
        return [
            Prompt(
                name="process-bacen-circular",
                description="Processa Circular BACEN e gera object_definitions/regras",
                arguments=[
                    {
                        "name": "circular_number",
                        "description": "Número da Circular (ex: 3.978)",
                        "required": True
                    },
                    {
                        "name": "pdf_url",
                        "description": "URL do PDF da Circular (opcional)",
                        "required": False
                    }
                ]
            )
        ]

    @server.get_prompt()
    async def get_bacen_circular_prompt(
        name: str,
        arguments: dict
    ) -> list[PromptMessage]:
        """Retorna prompt para processar Circular BACEN"""
        if name != "process-bacen-circular":
            raise ValueError(f"Prompt desconhecido: {name}")

        circular_number = arguments.get("circular_number")
        pdf_url = arguments.get("pdf_url")

        if not circular_number:
            raise ValueError("circular_number é obrigatório")

        template = f"""
Você é um especialista em regulamentação BACEN.

Tarefa: Processar Circular BACEN {circular_number} e extrair:

1. **Metadados**:
   - Data de publicação
   - Título completo
   - Assunto principal

2. **Regras Executáveis**:
   - Identificar todas as regras que podem ser expressas como condições
   - Formato: "SE <condição> ENTÃO <ação>"
   - Incluir referência à seção do manual (rastreabilidade)

3. **Object Definitions Sugeridos**:
   - Quais objetos de negócio são mencionados?
   - Quais campos cada objeto deve ter?
   - Quais validações BACEN se aplicam?

4. **Relacionamentos**:
   - Quais objetos se relacionam entre si?
   - Tipo de relacionamento (1:1, 1:N, N:M)

5. **FSMs (Ciclos de Vida)**:
   - Quais estados cada objeto pode ter?
   - Quais transições são permitidas?

{"PDF disponível em: " + pdf_url if pdf_url else f"Use RAG para consultar conteúdo da Circular {circular_number}"}

Formato de Saída: JSON estruturado conforme schemas do SuperCore.
"""

        return [
            PromptMessage(
                role="user",
                content={"type": "text", "text": template}
            )
        ]
```

---

## 3. Configuração do Claude Desktop App

### 3.1 Arquivo de Configuração

**Localização**:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Conteúdo**:
```json
{
  "mcpServers": {
    "supercore": {
      "command": "python",
      "args": ["-m", "mcp_server.main"],
      "cwd": "/path/to/supercore/mcp_server",
      "env": {
        "SUPERCORE_API_BASE": "http://localhost:8080/api/v1",
        "PYTHONPATH": "/path/to/supercore"
      }
    }
  }
}
```

---

### 3.2 Testando Conexão

```bash
# 1. Certifique-se que backend SuperCore está rodando
curl http://localhost:8080/api/v1/health

# 2. Teste o MCP Server via CLI
cd mcp_server
python -m mcp_server.main

# 3. Abra Claude Desktop App
# 4. Verifique se "supercore" aparece na lista de servidores MCP
```

---

## 4. Testes

### 4.1 Testes Unitários

```python
# mcp_server/tests/test_resources.py

import pytest
from unittest.mock import AsyncMock, patch
from mcp_server.resources.oracle import register_oracle_resources
from mcp import Server


@pytest.mark.asyncio
async def test_oracle_config_resource():
    """Testa resource oracle://config"""
    server = Server("test-server", "1.0.0")

    # Mock do backend SuperCore
    with patch("httpx.AsyncClient") as mock_client:
        mock_response = AsyncMock()
        mock_response.status_code = 200
        mock_response.text = '{"identity": {"cnpj": "12345678000190"}}'
        mock_response.json.return_value = {
            "identity": {"cnpj": "12345678000190"}
        }
        mock_response.raise_for_status = AsyncMock()

        mock_client.return_value.__aenter__.return_value.get.return_value = mock_response

        # Registra resource
        await register_oracle_resources(server, "http://mock-api")

        # Lista resources
        resources = await server.list_resources()
        assert len(resources) == 1
        assert resources[0].uri == "oracle://config"

        # Lê resource
        content = await server.read_resource("oracle://config")
        assert "identity" in content
```

---

### 4.2 Testes de Integração

```python
# mcp_server/tests/test_integration.py

import pytest
import asyncio
from mcp_server.main import main


@pytest.mark.asyncio
@pytest.mark.integration
async def test_mcp_server_startup():
    """Testa inicialização do MCP Server"""
    # Cria task assíncrona para rodar servidor
    server_task = asyncio.create_task(main())

    # Aguarda 2 segundos para servidor inicializar
    await asyncio.sleep(2)

    # Cancela servidor
    server_task.cancel()

    try:
        await server_task
    except asyncio.CancelledError:
        pass  # Esperado
```

---

### 4.3 Testes E2E com Claude Desktop App

**Cenário**: Criar contexto via Claude

```
1. Abra Claude Desktop App
2. Digite: "Usando o MCP Server supercore, crie um contexto chamado 'Teste PIX'"
3. Claude deve retornar: "Contexto criado com sucesso! ID: uuid-123"
4. Verifique no backend: GET http://localhost:8080/api/v1/context
5. ✅ Sucesso se contexto aparece na lista
```

---

## 5. Deploy e Monitoramento

### 5.1 Docker Compose

```yaml
# docker-compose.yml (adicionar serviço MCP)

services:
  # ... (backend, frontend, etc)

  mcp-server:
    build:
      context: ./mcp_server
      dockerfile: Dockerfile
    container_name: supercore-mcp-server
    environment:
      - SUPERCORE_API_BASE=http://backend:8080/api/v1
    volumes:
      - ./mcp_server:/app
    depends_on:
      - backend
    restart: unless-stopped
```

---

### 5.2 Dockerfile (MCP Server)

```dockerfile
# mcp_server/Dockerfile

FROM python:3.11-slim

WORKDIR /app

# Instala dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia código
COPY . .

# Expõe porta (se usando HTTP ao invés de stdio)
EXPOSE 8090

# Command
CMD ["python", "-m", "mcp_server.main"]
```

---

### 5.3 Logging e Monitoramento

```python
# mcp_server/main.py (adicionar)

import structlog

# Configuração de logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Log de todas as operações MCP
@server.call_tool()
async def call_tool_wrapper(name: str, arguments: dict):
    logger.info("MCP Tool Called", tool=name, arguments=arguments)
    result = await original_call_tool(name, arguments)
    logger.info("MCP Tool Result", tool=name, result=result)
    return result
```

---

## 6. Troubleshooting

### 6.1 Erros Comuns

**Erro**: `Connection refused to localhost:8080`
**Solução**: Certifique-se que backend SuperCore está rodando

```bash
# Verificar se backend está UP
curl http://localhost:8080/api/v1/health

# Se não estiver, iniciar backend
cd backend && go run cmd/api/main.go
```

---

**Erro**: `Module 'mcp' not found`
**Solução**: Instalar dependências

```bash
cd mcp_server
pip install -r requirements.txt
# Ou usando Poetry
poetry install
```

---

**Erro**: `Tool 'create_context' not found`
**Solução**: Verificar registro de tools

```python
# mcp_server/main.py
# Certifique-se que register_context_tools foi chamado

await register_context_tools(server, SUPERCORE_API_BASE)
```

---

### 6.2 Debug Mode

```bash
# Rodar MCP Server com logs verbose
export LOG_LEVEL=DEBUG
python -m mcp_server.main
```

---

### 6.3 Inspecionar Tráfego MCP

```python
# mcp_server/main.py (adicionar interceptor)

from mcp.types import Request, Response

@server.middleware
async def log_middleware(request: Request, call_next):
    logger.debug("MCP Request", method=request.method, params=request.params)
    response = await call_next(request)
    logger.debug("MCP Response", result=response.result)
    return response
```

---

## 7. Checklist de Implementação

### Sprint 1 (Semana 1)
- [ ] Setup estrutura de pastas
- [ ] Configurar Poetry + dependências
- [ ] Implementar main.py (entry point)
- [ ] Implementar Resource: oracle://config
- [ ] Testar com Claude Desktop App

### Sprint 2 (Semana 2)
- [ ] Implementar Tool: create_context
- [ ] Implementar Tool: process_context
- [ ] Implementar Resource: uploaded-files://{id}
- [ ] Testes unitários (resources + tools)

### Sprint 3 (Semana 3)
- [ ] Implementar Tool: wait_for_processing
- [ ] Implementar Resource: context-results://{id}
- [ ] Implementar Prompt: process-bacen-circular
- [ ] Testes de integração

### Sprint 4 (Semana 4)
- [ ] Implementar Resource: instances://{type}
- [ ] Implementar Tool: rag_query
- [ ] Testes E2E com Claude Desktop App
- [ ] Documentação completa (README)
- [ ] Docker Compose integration

---

## 8. Próximos Passos (Fase 2+)

### Fase 2: Specification Generation
- [ ] Tool: create_object_definition
- [ ] Resource: specifications://{context_id}
- [ ] Prompt: iterate-specification

### Fase 3: Object Graph Generation
- [ ] Tool: create_instance
- [ ] Tool: create_relationship
- [ ] Resource: relationships://{instance_id}

### Fase 4: Model Preview & Approval
- [ ] Tool: approve_model
- [ ] Resource: model-preview://{model_id}

### Fase 5: Dynamic UI
- [ ] Tool: generate_ui_component
- [ ] Resource: ui-schemas://{object_type}

---

## Referências

- **[SUPERCORE_MCP_SERVER.md](SUPERCORE_MCP_SERVER.md)** - ⭐⭐⭐ Especificação completa
- **[MCP Python SDK Docs](https://github.com/anthropics/mcp-python-sdk)** - SDK oficial
- **[MCP Specification](https://spec.modelcontextprotocol.io/)** - Spec oficial
- **[Claude Desktop App Docs](https://claude.ai/docs/desktop)** - Como configurar MCP Servers

---

**Status**: 🟡 Aguardando Implementação
**Versão**: 1.0.0
**Data de Última Atualização**: 2025-12-11
