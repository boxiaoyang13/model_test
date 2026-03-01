export default {
  id: 'gemini',
  name: 'Gemini',
  sub: 'Google AI Studio',
  badge: 'gemini-protocol',
  color: '#8b5cf6',
  baseUrl: 'https://gateway.theturbo.ai',
  models: {
    text: ['gemini-3-pro-preview', 'gemini-3-flash-preview', 'gemini-3.1-pro-preview'],
    image: ['gemini-2.5-flash-image', 'gemini-3-pro-image-preview', 'gemini-3.1-flash-image-preview'],
    video: ['veo-3.1-fast-generate-preview', 'veo-3.1-generate-preview']
  },
  testTypes: ['chat', 'chat-stream', 'reasoning', 'functioncall']
}
