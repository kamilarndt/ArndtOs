# ZeroClaw Model Knowledge

ZeroClaw uses a hierarchical routing system to optimize for performance, cost, and reliability.

## Primary Provider: Z.AI (GLM Family)
- **GLM-5**: used for complex reasoning, architectural decisions, and high-concurrency tasks.
- **GLM-4.7**: used for general coding, research, and standard agent workflows. (High context: 200k)
- **GLM-4.5-Air**: used for small, quick tasks and summaries to save tokens.

## Fallback Providers
1. **OpenRouter**: Secondary fallback for high-quality models if Z.AI is unavailable.
2. **NVIDIA NIM**: Tertiary fallback for open-weights models.
3. **Mistral**: Final fallback for Codestral/Mistral models.

## Routing Logic
- **Code/Refactor** -> GLM-4.7 (optimized for coding)
- **Planning/Architecture** -> GLM-5 (maximum intelligence)
- **Summarization/Simple** -> GLM-4.5-Air (cost-efficient)
- **Fallback** -> Cascade through OpenRouter -> NVIDIA -> Mistral.
