// PATCH: Add these routes after line 296 in main.go (after searchHandler routes)

		// RAG SQL Query routes
		if ragHandler != nil {
			v1.POST("/rag/query/sql", ragHandler.QuerySQL)
		}

		// RAG Graph Query routes
		if ragGraphHandler != nil {
			v1.POST("/rag/query/graph", ragGraphHandler.QueryGraph)
			v1.POST("/rag/sync/instance/:id", ragGraphHandler.SyncInstance)
			v1.POST("/rag/sync/relationship/:id", ragGraphHandler.SyncRelationship)
			v1.POST("/rag/sync/all", ragGraphHandler.SyncAll)
			v1.GET("/rag/graph/stats", ragGraphHandler.GetGraphStats)
		}
