export default {
  id: 'gemini',
  name: 'Gemini',
  sub: 'Google AI Studio',
  badge: 'gemini-protocol',
  color: '#8b5cf6',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  models: {
    text: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    image: ['imagen-3.0', 'imagen-2.0', 'gemini-vision'],
    video: ['veo-2', 'veo-1']
  },
  testTypes: ['chat', 'chat-stream', 'reasoning', 'functioncall', 'struct', 'embedding', 'multimodal', 'batch']
}
