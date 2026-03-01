export default {
  id: 'gemini',
  name: 'Gemini',
  sub: 'Google AI Studio',
  badge: 'gemini-protocol',
  color: '#8b5cf6',
  baseUrl: 'https://gateway.theturbo.ai',
  models: {
    text: ['gemini-3-pro-preview', 'gemini-3-flash-preview', 'gemini-3.1-pro-preview'],
    image: ['imagen-3.0', 'imagen-2.0', 'gemini-vision'],
    video: ['veo-2', 'veo-1']
  },
  testTypes: ['chat', 'chat-stream', 'reasoning', 'functioncall', 'struct']
}
