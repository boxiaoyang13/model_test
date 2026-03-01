export default {
  id: 'anthropic',
  name: 'Anthropic',
  sub: 'Claude API',
  badge: 'anthropic-protocol',
  color: '#e8673c',
  baseUrl: 'https://api.anthropic.com/v1',
  models: {
    text: ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-4-5', 'claude-3-5-sonnet', 'claude-3-opus'],
    image: ['claude-3-5-sonnet-vision', 'claude-3-opus-vision'],
    video: []
  },
  testTypes: ['chat', 'chat-stream', 'reasoning', 'functioncall', 'struct']
}
