package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lbpay/supercore/internal/database"
)

type OracleHandler struct {
	db *database.DB
}

func NewOracleHandler(db *database.DB) *OracleHandler {
	return &OracleHandler{db: db}
}

// OracleIdentity representa a identidade fundamental da plataforma
type OracleIdentity struct {
	CNPJ          string                 `json:"cnpj"`
	RazaoSocial   string                 `json:"razao_social"`
	NomeFantasia  string                 `json:"nome_fantasia"`
	LogoURL       string                 `json:"logo_url,omitempty"`
	Cores         map[string]interface{} `json:"cores_institucionais,omitempty"`
	EnderecoSede  map[string]interface{} `json:"endereco_sede,omitempty"`
	Contatos      map[string]interface{} `json:"contatos,omitempty"`
	CapitalSocial float64                `json:"capital_social,omitempty"`
}

// OracleLicense representa uma licença BACEN
type OracleLicense struct {
	TipoAutorizacao string                 `json:"tipo_autorizacao"`
	Numero          string                 `json:"numero_autorizacao"`
	DataConcessao   string                 `json:"data_concessao"`
	Status          string                 `json:"status"`
	Condicoes       map[string]interface{} `json:"condicoes_operacionais,omitempty"`
}

// OracleStatus representa o status completo do Oráculo
type OracleStatus struct {
	Identidade   OracleIdentity  `json:"identidade"`
	Licencas     []OracleLicense `json:"licencas"`
	Integracoes  []string        `json:"integracoes_ativas"`
	Timestamp    time.Time       `json:"timestamp"`
	Consciousness string         `json:"consciousness"`
}

// GetIdentity godoc
// @Summary Get Oracle Identity
// @Description Retorna a identidade corporativa do Oráculo (quem somos)
// @Tags oracle
// @Accept json
// @Produce json
// @Success 200 {object} OracleIdentity
// @Router /api/v1/oracle/identity [get]
func (h *OracleHandler) GetIdentity(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Busca a instance única de identidade_corporativa
	var data json.RawMessage
	err := h.db.Pool.QueryRow(ctx, `
		SELECT i.data
		FROM instances i
		JOIN object_definitions od ON i.object_definition_id = od.id
		WHERE od.name = 'identidade_corporativa'
		  AND i.is_deleted = false
		ORDER BY i.created_at DESC
		LIMIT 1
	`).Scan(&data)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Identidade corporativa não encontrada no Oráculo",
			"hint":  "Execute o seed 003_oraculo_seed.sql para inicializar o Oráculo",
		})
		return
	}

	var identity OracleIdentity
	if err := json.Unmarshal(data, &identity); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao parsear identidade"})
		return
	}

	c.JSON(http.StatusOK, identity)
}

// GetLicenses godoc
// @Summary Get Oracle Licenses
// @Description Retorna todas as licenças e autorizações BACEN ativas
// @Tags oracle
// @Accept json
// @Produce json
// @Success 200 {array} OracleLicense
// @Router /api/v1/oracle/licenses [get]
func (h *OracleHandler) GetLicenses(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := h.db.Pool.Query(ctx, `
		SELECT i.data
		FROM instances i
		JOIN object_definitions od ON i.object_definition_id = od.id
		WHERE od.name = 'licenca_bacen'
		  AND i.is_deleted = false
		  AND i.current_state = 'ATIVA'
		ORDER BY i.created_at DESC
	`)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao buscar licenças"})
		return
	}
	defer rows.Close()

	licenses := []OracleLicense{}
	for rows.Next() {
		var data json.RawMessage
		if err := rows.Scan(&data); err != nil {
			continue
		}

		var license OracleLicense
		if err := json.Unmarshal(data, &license); err != nil {
			continue
		}
		licenses = append(licenses, license)
	}

	c.JSON(http.StatusOK, licenses)
}

// GetStatus godoc
// @Summary Get Oracle Complete Status
// @Description Retorna o status completo do Oráculo (identidade + licenças + integrações)
// @Tags oracle
// @Accept json
// @Produce json
// @Success 200 {object} OracleStatus
// @Router /api/v1/oracle/status [get]
func (h *OracleHandler) GetStatus(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Busca identidade
	var identityData json.RawMessage
	err := h.db.Pool.QueryRow(ctx, `
		SELECT i.data
		FROM instances i
		JOIN object_definitions od ON i.object_definition_id = od.id
		WHERE od.name = 'identidade_corporativa'
		  AND i.is_deleted = false
		ORDER BY i.created_at DESC
		LIMIT 1
	`).Scan(&identityData)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Oráculo não inicializado",
			"hint":  "Execute database/seeds/003_oraculo_seed.sql",
		})
		return
	}

	var identity OracleIdentity
	json.Unmarshal(identityData, &identity)

	// Busca licenças ativas
	licensesRows, _ := h.db.Pool.Query(ctx, `
		SELECT i.data
		FROM instances i
		JOIN object_definitions od ON i.object_definition_id = od.id
		WHERE od.name = 'licenca_bacen'
		  AND i.is_deleted = false
		  AND i.current_state = 'ATIVA'
	`)
	defer licensesRows.Close()

	licenses := []OracleLicense{}
	for licensesRows.Next() {
		var data json.RawMessage
		licensesRows.Scan(&data)
		var license OracleLicense
		if err := json.Unmarshal(data, &license); err == nil {
			licenses = append(licenses, license)
		}
	}

	// Busca integrações ativas
	integracoesRows, _ := h.db.Pool.Query(ctx, `
		SELECT od.display_name, i.current_state
		FROM instances i
		JOIN object_definitions od ON i.object_definition_id = od.id
		WHERE od.category = 'INTEGRATION'
		  AND i.is_deleted = false
		  AND i.current_state IN ('ATIVO', 'CONECTADO')
	`)
	defer integracoesRows.Close()

	integracoes := []string{}
	for integracoesRows.Next() {
		var nome, estado string
		integracoesRows.Scan(&nome, &estado)
		integracoes = append(integracoes, nome+" ("+estado+")")
	}

	// Constrói a "frase de consciência"
	consciousness := "Eu sou " + identity.NomeFantasia + ", "
	consciousness += "CNPJ " + identity.CNPJ + ", "
	consciousness += "com " + formatLicenses(licenses) + " ativas, "
	consciousness += "conectado a " + formatIntegracoes(integracoes) + "."

	status := OracleStatus{
		Identidade:    identity,
		Licencas:      licenses,
		Integracoes:   integracoes,
		Timestamp:     time.Now(),
		Consciousness: consciousness,
	}

	c.JSON(http.StatusOK, status)
}

// WhoAmI godoc
// @Summary Who Am I?
// @Description Retorna a "frase de consciência" do Oráculo
// @Tags oracle
// @Accept json
// @Produce json
// @Success 200 {object} map[string]string
// @Router /api/v1/oracle/whoami [get]
func (h *OracleHandler) WhoAmI(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var identityData json.RawMessage
	err := h.db.Pool.QueryRow(ctx, `
		SELECT i.data
		FROM instances i
		JOIN object_definitions od ON i.object_definition_id = od.id
		WHERE od.name = 'identidade_corporativa'
		  AND i.is_deleted = false
		LIMIT 1
	`).Scan(&identityData)

	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"consciousness": "Eu não sei quem sou. O Oráculo não foi inicializado.",
			"hint":          "Execute database/seeds/003_oraculo_seed.sql",
		})
		return
	}

	var identity OracleIdentity
	json.Unmarshal(identityData, &identity)

	// Conta licenças ativas
	var licenseCount int
	h.db.Pool.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM instances i
		JOIN object_definitions od ON i.object_definition_id = od.id
		WHERE od.name = 'licenca_bacen'
		  AND i.is_deleted = false
		  AND i.current_state = 'ATIVA'
	`).Scan(&licenseCount)

	consciousness := "Eu sou " + identity.NomeFantasia
	consciousness += " (CNPJ: " + formatCNPJ(identity.CNPJ) + "), "
	consciousness += "uma instituição financeira licenciada pelo Banco Central do Brasil"

	if licenseCount > 0 {
		consciousness += " com " + formatNumber(licenseCount) + " licença(s) ativa(s)"
	}

	consciousness += ". Estou operacional e consciente de minha identidade e responsabilidades regulatórias."

	c.JSON(http.StatusOK, gin.H{
		"consciousness": consciousness,
		"nome_fantasia": identity.NomeFantasia,
		"cnpj":          identity.CNPJ,
		"licencas":      licenseCount,
	})
}

// Helper functions

func formatCNPJ(cnpj string) string {
	if len(cnpj) != 14 {
		return cnpj
	}
	return cnpj[0:2] + "." + cnpj[2:5] + "." + cnpj[5:8] + "/" + cnpj[8:12] + "-" + cnpj[12:14]
}

func formatNumber(n int) string {
	if n == 1 {
		return "1"
	}
	return string(rune(n + '0'))
}

func formatLicenses(licenses []OracleLicense) string {
	if len(licenses) == 0 {
		return "nenhuma licença"
	}
	if len(licenses) == 1 {
		return "licença de " + licenses[0].TipoAutorizacao
	}
	return string(rune(len(licenses)+'0')) + " licenças"
}

func formatIntegracoes(integracoes []string) string {
	if len(integracoes) == 0 {
		return "nenhuma integração externa"
	}
	if len(integracoes) == 1 {
		return integracoes[0]
	}
	return string(rune(len(integracoes)+'0')) + " sistemas externos"
}
