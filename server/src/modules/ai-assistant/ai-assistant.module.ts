import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AIAssistantService } from './ai-assistant.service';
import { AIAssistantResolver } from './ai-assistant.resolver';
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 120000, // 2 minute timeout for LLM calls
      maxRedirects: 5,
    }),
    RagModule,
  ],
  providers: [AIAssistantService, AIAssistantResolver],
  exports: [AIAssistantService],
})
export class AIAssistantModule {}
