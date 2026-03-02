export default {
  id: 'openai',
  name: 'OpenAI',
  sub: 'OpenAI API',
  badge: 'openai-protocol',
  color: '#10a37f',
  baseUrl: 'https://gateway.theturbo.ai',
  models: {
    text: ['gpt-4.1', 'gpt-5.1', 'gpt-5.2'],
    image: ['gpt-image-1', 'gpt-image-1.5'],
    video: ['sora-2']
  },
  testTypes: ['chat', 'chat-stream', 'reasoning', 'functioncall']
}
