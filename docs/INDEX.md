# SuperCore Documentation Index

Welcome to the comprehensive documentation for SuperCore - Universal Entity Management Platform.

**Last Updated**: 2024-12-10

---

## Quick Start

**New to SuperCore?** Start here:

1. [What is SuperCore?](../README.md#what-is-supercore) - 5-minute overview
2. [Quick Start Guide](../README.md#quick-start) - Get running in 10 minutes
3. [Getting Started Tutorial](user-guide/01-getting-started.md) - Your first steps

---

## Documentation by Audience

### For Product Managers & Business Users

**Goal**: Create and manage business objects without coding

- [Getting Started Guide](user-guide/01-getting-started.md) - First steps with SuperCore
- Creating Object Definitions (Coming Soon)
- Managing Instances (Coming Soon)
- Understanding Relationships (Coming Soon)
- State Machines (Coming Soon)
- Using RAG Search (Coming Soon)

### For Developers

**Goal**: Extend SuperCore or integrate it with other systems

- [Development Guide](dev-guide/development.md) - Local setup and workflow
- [API Reference](api/README.md) - Complete API documentation
- Architecture Overview (Coming Soon)
- Database Schema Details (Coming Soon)
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute

### For DevOps & SREs

**Goal**: Deploy and maintain SuperCore in production

- [Deployment Guide](ops/deployment.md) - Production deployment
- Monitoring Guide (Coming Soon)
- [Troubleshooting](ops/troubleshooting.md) - Common issues and solutions
- Backup & Recovery (Coming Soon)
- Security Guide (Coming Soon)

---

## Complete API Documentation

### API Reference

- [Complete API Documentation](api/README.md) - Full API reference
- [Authentication](api/README.md#authentication)
- [Error Handling](api/README.md#error-handling)
- [Rate Limiting](api/README.md#rate-limiting)

### Key Endpoints

**Oracle (Platform Consciousness)**
- `GET /api/v1/oracle/whoami` - Platform self-description
- `GET /api/v1/oracle/identity` - Corporate identity
- `GET /api/v1/oracle/licenses` - BACEN licenses
- `GET /api/v1/oracle/status` - Complete platform status

**Object Management**
- `GET /api/v1/object-definitions` - List all objects
- `POST /api/v1/object-definitions` - Create new object
- `GET /api/v1/instances` - List instances
- `POST /api/v1/instances` - Create instance
- `POST /api/v1/instances/:id/transition` - Change state

**Search & AI**
- `POST /api/v1/search/semantic` - Semantic search
- `POST /api/v1/assistant/chat` - Chat with assistant

### API Examples

- [Oracle Examples](api/examples/00-oracle-whoami.md)
- [Creating Objects](api/examples/)
- [Managing Instances](api/examples/)
- [Relationship Examples](api/RELATIONSHIP_VALIDATION.md)

---

## Project Documentation

### Phase 1 - Foundation (Current)

- [Phase 1 Complete Scope](fase1/FASE_1_ESCOPO_TECNICO_COMPLETO.md)
- [Implementation Status](fase1/IMPLEMENTATION_STATUS.md)
- [Squad & Sprints](fase1/SQUAD_E_SPRINTS_FASE_1.md)
- [Oracle Implementation](fase1/ORACLE_IMPLEMENTATION_COMPLETE.md)
- [Keycloak Integration](fase1/KEYCLOAK_INTEGRATION_GUIDE.md)

### Implementation Bible

- [CLAUDE.md](../CLAUDE.md) - Complete implementation guide and philosophy

---

## Quick Navigation

### I want to...

**...use SuperCore for the first time**
→ Start with [Getting Started](user-guide/01-getting-started.md)

**...understand what SuperCore is**
→ Read [README.md](../README.md#what-is-supercore)

**...integrate with SuperCore API**
→ Check [API Reference](api/README.md) and [Examples](api/examples/)

**...set up local development**
→ Follow [Development Guide](dev-guide/development.md)

**...deploy to production**
→ Follow [Deployment Guide](ops/deployment.md)

**...troubleshoot an issue**
→ See [Troubleshooting Guide](ops/troubleshooting.md)

**...contribute to the project**
→ Read [Contributing Guide](../CONTRIBUTING.md)

## Documentation Principles

This documentation follows these principles:

1. **Progressive Disclosure**: Start simple, reveal complexity gradually
2. **Audience-Specific**: Each section targets specific roles
3. **Example-Driven**: Real examples for every concept
4. **Always Current**: Documentation is maintained alongside code
5. **Visual First**: Diagrams before text when possible

## Contributing to Documentation

Documentation is code. All documentation lives in the `/docs` directory and follows these conventions:

- Use Markdown format
- Include diagrams using Mermaid
- Add code examples with syntax highlighting
- Link related documents extensively
- Update the index when adding new documents

---

## Documentation Status

### Completed Documentation

- ✅ Main README with comprehensive overview
- ✅ Complete API Reference (70+ endpoints documented)
- ✅ Deployment Guide (Docker Compose + Kubernetes)
- ✅ User Guide - Getting Started
- ✅ Development Guide (full workflow)
- ✅ Troubleshooting Guide (comprehensive)
- ✅ Contributing Guide
- ✅ CI/CD Pipeline Documentation

### Planned Documentation

- [ ] User Guide - Complete series (6 chapters)
- [ ] Architecture Deep Dive
- [ ] Database Schema Details
- [ ] Monitoring & Observability Guide
- [ ] Security Best Practices
- [ ] Performance Tuning Guide
- [ ] Frontend Guide (Phase 2)
- [ ] Video Tutorials

---

## Version Information

- **Platform Version**: 1.0.0
- **Documentation Last Updated**: 2024-12-10
- **API Version**: v1
- **Database Schema Version**: 001

---

## Getting Help

### Self-Service

1. Search this documentation (Cmd/Ctrl+F)
2. Check [Troubleshooting Guide](ops/troubleshooting.md)
3. Review [API Examples](api/examples/)
4. Browse [GitHub Issues](https://github.com/lbpay/supercore/issues)

### Community Support

- [GitHub Discussions](https://github.com/lbpay/supercore/discussions) - Ask questions
- [GitHub Issues](https://github.com/lbpay/supercore/issues) - Report bugs
- **Email**: dev@lbpay.com.br

### Contributing

Want to improve the documentation?

1. Read [Contributing Guide](../CONTRIBUTING.md)
2. Submit documentation PRs
3. Help answer questions in Discussions

---

**Made with precision by the SuperCore Documentation Architect**

*Creating Core Banking systems in days, not months.*
