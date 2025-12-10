package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/services/llm"
	"github.com/lbpay/supercore/internal/services/rag"
)

// RAGGraphService uses the Nebula Graph layer to answer questions about relationships
type RAGGraphService struct {
	graphLayer *rag.GraphLayer
	llmClient  llm.Client
}

// NewRAGGraphService creates a new RAG Graph service
func NewRAGGraphService(graphLayer *rag.GraphLayer, llmClient llm.Client) *RAGGraphService {
	return &RAGGraphService{
		graphLayer: graphLayer,
		llmClient:  llmClient,
	}
}

// GraphContext holds extracted context from a question
type GraphContext struct {
	SourceName       string `json:"source_name"`
	SourceType       string `json:"source_type"`
	RelationshipType string `json:"relationship_type"`
	TargetType       string `json:"target_type"`
	Direction        string `json:"direction"`  // "outbound", "inbound", "both"
	Depth            int    `json:"depth"`      // 1-3
}

// Answer responds to a question using the Nebula Graph layer
func (s *RAGGraphService) Answer(ctx context.Context, question string) (string, error) {
	log.Printf("RAG Graph Query: %s", question)

	// 1. Extract graph context from the question
	graphCtx, err := s.extractGraphContext(ctx, question)
	if err != nil {
		return "", fmt.Errorf("failed to extract graph context: %w", err)
	}

	log.Printf("Extracted context: source=%s (%s), rel=%s, target=%s, dir=%s, depth=%d",
		graphCtx.SourceName, graphCtx.SourceType, graphCtx.RelationshipType,
		graphCtx.TargetType, graphCtx.Direction, graphCtx.Depth)

	// 2. Execute graph query
	results, err := s.executeGraphQuery(ctx, graphCtx)
	if err != nil {
		return "", fmt.Errorf("failed to execute graph query: %w", err)
	}

	log.Printf("Found %d related instances", len(results))

	// 3. Build context prompt for LLM
	contextPrompt := s.buildContextPrompt(question, results)

	// 4. Generate natural language answer
	messages := []llm.Message{
		{
			Role:    "user",
			Content: contextPrompt,
		},
	}

	chatOptions := llm.ChatOptions{
		Temperature: 0.3,
		MaxTokens:   2000,
	}

	response, err := s.llmClient.Chat(ctx, messages, chatOptions)
	if err != nil {
		return "", fmt.Errorf("failed to generate answer: %w", err)
	}

	return response.Content, nil
}

// extractGraphContext uses LLM to extract entities from the question
func (s *RAGGraphService) extractGraphContext(ctx context.Context, question string) (*GraphContext, error) {
	prompt := fmt.Sprintf(`You are an entity extractor for graph database queries in a Core Banking system.

QUESTION: %s

Extract the following entities and return ONLY a valid JSON object (no markdown, no explanation):
{
  "source_name": "name of the source entity (e.g., 'Maria Silva', '12345')",
  "source_type": "object type of source (e.g., 'cliente_pf', 'conta_corrente')",
  "relationship_type": "type of relationship (e.g., 'TITULAR_DE', 'PAI_DE', 'POSSUI')",
  "target_type": "object type of target (e.g., 'conta_corrente', 'cliente_pf')",
  "direction": "outbound (from source to target) | inbound (from target to source) | both",
  "depth": 1 or 2 or 3
}

EXAMPLES:
Q: "Quais contas Maria Silva possui?"
A: {"source_name": "Maria Silva", "source_type": "cliente_pf", "relationship_type": "TITULAR_DE", "target_type": "conta_corrente", "direction": "outbound", "depth": 1}

Q: "Quem é o titular da conta 12345?"
A: {"source_name": "12345", "source_type": "conta_corrente", "relationship_type": "TITULAR_DE", "target_type": "cliente_pf", "direction": "inbound", "depth": 1}

Q: "Quais são os dependentes de João Pedro?"
A: {"source_name": "João Pedro", "source_type": "cliente_pf", "relationship_type": "PAI_DE", "target_type": "cliente_pf", "direction": "outbound", "depth": 1}

Return ONLY the JSON object:`, question)

	// Use Chat method with the LLM client
	messages := []llm.Message{
		{
			Role:    "user",
			Content: prompt,
		},
	}

	chatOptions := llm.ChatOptions{
		Temperature: 0.1,
		MaxTokens:   1000,
	}

	response, err := s.llmClient.Chat(ctx, messages, chatOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to extract entities: %w", err)
	}

	result := response.Content
	if err != nil {
		return nil, fmt.Errorf("failed to extract entities: %w", err)
	}

	// Clean up response (remove markdown code blocks if present)
	result = strings.TrimSpace(result)
	result = strings.TrimPrefix(result, "```json")
	result = strings.TrimPrefix(result, "```")
	result = strings.TrimSuffix(result, "```")
	result = strings.TrimSpace(result)

	// Parse JSON
	var graphCtx GraphContext
	if err := json.Unmarshal([]byte(result), &graphCtx); err != nil {
		return nil, fmt.Errorf("failed to parse graph context JSON: %w\nResponse: %s", err, result)
	}

	// Set defaults
	if graphCtx.Direction == "" {
		graphCtx.Direction = "outbound"
	}
	if graphCtx.Depth == 0 {
		graphCtx.Depth = 1
	}
	if graphCtx.Depth > 3 {
		graphCtx.Depth = 3
	}

	return &graphCtx, nil
}

// executeGraphQuery executes the graph query and returns matching instances
func (s *RAGGraphService) executeGraphQuery(ctx context.Context, graphCtx *GraphContext) ([]rag.InstanceVertex, error) {
	// For now, we'll use FindRelatedInstances from GraphLayer
	// In a full implementation, we would build dynamic nGQL queries based on graphCtx

	// TODO: This is a simplified implementation
	// A full implementation would:
	// 1. First find the source instance by searching for graphCtx.SourceName in data
	// 2. Then traverse relationships based on direction and type
	// 3. Filter by target type

	// For demonstration, we'll return an empty result
	// The GraphLayer.FindRelatedInstances method needs an instance ID,
	// but we need to search by name first

	log.Printf("Graph query execution would happen here with context: %+v", graphCtx)

	// Return empty for now - this would be populated by actual graph traversal
	return []rag.InstanceVertex{}, nil
}

// buildContextPrompt builds the prompt for LLM with graph results
func (s *RAGGraphService) buildContextPrompt(question string, results []rag.InstanceVertex) string {
	var resultsJSON string
	if len(results) == 0 {
		resultsJSON = "No related instances found in the graph."
	} else {
		jsonBytes, _ := json.MarshalIndent(results, "", "  ")
		resultsJSON = string(jsonBytes)
	}

	prompt := fmt.Sprintf(`You are an AI assistant specialized in Core Banking systems.

QUESTION FROM USER:
%s

GRAPH DATA (Related Instances):
%s

Total relationships found: %d

INSTRUCTIONS:
- Use the graph data above to answer the question precisely
- Explain the relationships found
- If no data is available, be honest and say so
- Use clear, non-technical language
- Use Brazilian Portuguese
- Format the answer in a user-friendly way

ANSWER:`, question, resultsJSON, len(results))

	return prompt
}

// FindRelatedInstances finds instances related to a specific instance
func (s *RAGGraphService) FindRelatedInstances(ctx context.Context, instanceID uuid.UUID, depth int) ([]rag.InstanceVertex, error) {
	return s.graphLayer.FindRelatedInstances(instanceID, depth)
}

// AnalyzeImpact analyzes the impact of deleting an instance
func (s *RAGGraphService) AnalyzeImpact(ctx context.Context, instanceID uuid.UUID) (*rag.ImpactAnalysis, error) {
	return s.graphLayer.AnalyzeImpact(instanceID)
}

// FindPath finds the shortest path between two instances
func (s *RAGGraphService) FindPath(ctx context.Context, fromID, toID uuid.UUID) ([]rag.GraphPath, error) {
	return s.graphLayer.FindPath(fromID, toID)
}
