export default {
  id: 'openai',
  name: 'OpenAI',
  sub: 'OpenAI API',
  badge: 'openai-protocol',
  color: '#10a37f',
  baseUrl: 'https://api.openai.com/v1',
  models: {
    text: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o1', 'o3-mini'],
    image: ['dall-e-3', 'dall-e-2', 'gpt-4-vision'],
    video: ['sora']
  },
  testTypes: ['chat', 'chat-stream', 'reasoning', 'functioncall', 'struct']
}
