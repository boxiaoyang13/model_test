export default {
  id: 'anthropic',
  name: 'Anthropic',
  sub: 'Claude API',
  badge: 'anthropic-protocol',
  color: '#e8673c',
  baseUrl: 'https://gateway.theturbo.ai',
  models: {
    text: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001']
  },
  testTypes: ['chat', 'chat-stream', 'reasoning', 'functioncall']
}
