import { 
  initializeApp, 
  FirebaseApp, 
  getApps 
} from 'firebase/app';
import { 
  getAI, 
  getGenerativeModel,
  GoogleAIBackend,
  VertexAIBackend
} from 'firebase/ai';
import {
  Genkit,
  GenkitError,
  z
} from 'genkit';
import {
  GenkitPlugin,
  genkitPlugin
} from 'genkit/plugin';
import {
  ModelReference,
  GenerateRequest,
  GenerateResponseData,
  CandidateData,
  Part,
  modelRef
} from 'genkit/model';

// Plugin Options Interface
export interface FirebaseAILogicOptions {
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  
  backend?: 'googleAI' | 'vertexAI';
  vertexAIRegion?: string;
  firebaseApp?: FirebaseApp;
}

// Configuration schema
const FirebaseAILogicConfigSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  topK: z.number().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  maxOutputTokens: z.number().positive().optional(),
  stopSequences: z.array(z.string()).optional(),
  candidateCount: z.number().positive().max(8).optional(),
  responseMimeType: z.string().optional(),
  responseSchema: z.any().optional(),
  systemInstruction: z.union([z.string(), z.object({
    role: z.literal('system'),
    parts: z.array(z.object({
      text: z.string()
    }))
  })]).optional()
});

export type FirebaseAILogicConfig = z.infer<typeof FirebaseAILogicConfigSchema>;

// Global storage for Firebase AI instances
let globalFirebaseAI: any = null;
let globalOptions: FirebaseAILogicOptions = {};

// Initialize Firebase app
function initializeFirebaseApp(options: FirebaseAILogicOptions): FirebaseApp {
  if (options.firebaseApp) {
    return options.firebaseApp;
  }
  
  if (options.firebaseConfig) {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      return existingApps[0];
    }
    return initializeApp(options.firebaseConfig);
  }
  
  throw new GenkitError({
    source: 'firebase-ai-logic-plugin',
    status: 'INVALID_ARGUMENT',
    message: 'Must provide either firebaseConfig or firebaseApp in plugin options'
  });
}

// Get AI backend
function getAIBackend(backend: 'googleAI' | 'vertexAI', region?: string) {
  switch (backend) {
    case 'googleAI':
      return new GoogleAIBackend();
    case 'vertexAI':
      return new VertexAIBackend(region || 'us-central1');
    default:
      throw new GenkitError({
        source: 'firebase-ai-logic-plugin',
        status: 'INVALID_ARGUMENT',
        message: `Unsupported backend: ${backend}`
      });
  }
}

// Convert Genkit request to Firebase AI format
function toFirebaseAIRequest(request: GenerateRequest): string | any[] {
  // Handle messages array (primary way in Genkit)
  if (request.messages) {
    const messages = request.messages as any[];
    if (Array.isArray(messages) && messages.length > 0) {
      // For Firebase AI generateContent, we should only send the last user message
      // Firebase AI's generateContent doesn't handle conversation history directly
      // (that's what startChat() is for)
      
      // Find the last user message
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
      
      if (lastUserMessage && Array.isArray(lastUserMessage.content)) {
        const parts: any[] = [];
        
        for (const part of lastUserMessage.content) {
          if (part.text) {
            parts.push({ text: part.text });
          } else if (part.media) {
            if (part.media.url.startsWith('data:')) {
              const [mimeType, data] = part.media.url.split(',');
              const actualMimeType = mimeType.split(':')[1].split(';')[0];
              parts.push({
                inlineData: {
                  mimeType: actualMimeType,
                  data: data
                }
              });
            } else if (part.media.url.startsWith('gs://')) {
              parts.push({
                fileData: {
                  mimeType: part.media.contentType,
                  fileUri: part.media.url
                }
              });
            }
          }
        }
        
        // For single text part, return as simple string
        if (parts.length === 1 && parts[0].text) {
          return parts[0].text;
        }
        
        // For multiple parts or media, return as array
        if (parts.length > 0) {
          return parts;
        }
      }
      
      // Fallback - try to extract text from last message
      if (lastUserMessage?.content?.[0]?.text) {
        return lastUserMessage.content[0].text;
      }
    }
  }
  
  // If we get here, we couldn't extract any valid content
  throw new GenkitError({
    source: 'firebase-ai-logic-plugin',
    status: 'INVALID_ARGUMENT',
    message: 'Unable to extract valid content from request. Please provide messages with text content in the correct format.'
  });
}

// Extract system instruction from request
function extractSystemInstruction(request: GenerateRequest): string | undefined {
  if (request.config?.systemInstruction) {
    if (typeof request.config.systemInstruction === 'string') {
      return request.config.systemInstruction;
    }
    if (typeof request.config.systemInstruction === 'object' && 
        request.config.systemInstruction.parts?.[0]?.text) {
      return request.config.systemInstruction.parts[0].text;
    }
  }
  
  // Check messages for system role
  if (request.messages && Array.isArray(request.messages)) {
    for (const message of request.messages) {
      if (message.role === 'system' && message.content?.[0]?.text) {
        return message.content[0].text;
      }
    }
  }
  
  return undefined;
}

// Convert Firebase AI response to Genkit format
function toGenkitResponse(response: any): GenerateResponseData {
  try {
    // Extract text using Firebase AI's .text() method
    let text = '';
    if (response && typeof response.response?.text === 'function') {
      text = response.response.text();
    } else if (typeof response.text === 'function') {
      text = response.text();
    } else if (response.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = response.response.candidates[0].content.parts[0].text;
    } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = response.candidates[0].content.parts[0].text;
    }
    
    const candidates: CandidateData[] = [{
      index: 0,
      message: {
        role: 'model',
        content: [{ text }]
      },
      finishReason: 'stop',
      custom: {
        safetyRatings: response.response?.candidates?.[0]?.safetyRatings,
        citationMetadata: response.response?.candidates?.[0]?.citationMetadata
      }
    }];
    
    // Extract usage metadata
    const usageMetadata = response.response?.usageMetadata || {};
    
    return {
      candidates,
      usage: {
        inputTokens: usageMetadata.promptTokenCount || 0,
        outputTokens: usageMetadata.candidatesTokenCount || 0,
        totalTokens: usageMetadata.totalTokenCount || 0
      },
      custom: {
        promptFeedback: response.response?.promptFeedback
      }
    };
  } catch (error) {
    return {
      candidates: [{
        index: 0,
        message: {
          role: 'model',
          content: [{ text: `Error processing response: ${error instanceof Error ? error.message : 'Unknown error'}` }]
        },
        finishReason: 'other',
        custom: { error: error instanceof Error ? error.message : 'Unknown error' }
      }],
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0
      },
      custom: {}
    };
  }
}

// Create Firebase AI Logic model
function createFirebaseAILogicModel(
  ai: Genkit,
  modelName: string,
  firebaseAI: any,
  options: FirebaseAILogicOptions
) {
  return ai.defineModel(
    {
      name: `firebase-ai-logic/${modelName}`, // Add prefix here for internal Genkit registration
      label: `Firebase AI Logic ${modelName}`,
      supports: {
        multiturn: true,
        media: true,
        tools: false,
        systemRole: true,
        output: ['text', 'json']
      },
      configSchema: FirebaseAILogicConfigSchema
    },
    async (request: GenerateRequest) => {
      try {
        // Build model configuration
        const modelConfig: any = {
          model: modelName // Use the original model name for Firebase AI, not the prefixed version
        };
        
        // Add generation config
        if (request.config) {
          const generationConfig: any = {};
          
          if (request.config.temperature !== undefined) {
            generationConfig.temperature = request.config.temperature;
          }
          if (request.config.topK !== undefined) {
            generationConfig.topK = request.config.topK;
          }
          if (request.config.topP !== undefined) {
            generationConfig.topP = request.config.topP;
          }
          if (request.config.maxOutputTokens !== undefined) {
            generationConfig.maxOutputTokens = request.config.maxOutputTokens;
          }
          if (request.config.stopSequences) {
            generationConfig.stopSequences = request.config.stopSequences;
          }
          if (request.config.candidateCount) {
            generationConfig.candidateCount = request.config.candidateCount;
          }
          if (request.config.responseMimeType) {
            generationConfig.responseMimeType = request.config.responseMimeType;
          }
          if (request.config.responseSchema) {
            generationConfig.responseSchema = request.config.responseSchema;
          }
          
          if (Object.keys(generationConfig).length > 0) {
            modelConfig.generationConfig = generationConfig;
          }
        }
        
        // Add system instruction
        const systemInstruction = extractSystemInstruction(request);
        if (systemInstruction) {
          modelConfig.systemInstruction = systemInstruction;
        }
        
        // Get the Firebase AI model
        const model = getGenerativeModel(firebaseAI, modelConfig);
        
        // Convert request to Firebase AI format
        const content = toFirebaseAIRequest(request);
        
        console.log(`Generating content with model: ${modelName}`, { 
          modelConfig, 
          content: typeof content === 'string' ? content : JSON.stringify(content, null, 2)
        });
        
        // Generate content - Firebase AI generateContent expects the content directly
        const response = await model.generateContent(content);
        
        return toGenkitResponse(response);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Firebase AI Logic generation failed for model ${modelName}:`, error);
        throw new GenkitError({
          source: 'firebase-ai-logic-plugin',
          status: 'INTERNAL',
          message: `Firebase AI Logic generation failed: ${errorMessage}`
        });
      }
    }
  );
}

// Main plugin function
function createFirebaseAILogicPlugin(options: FirebaseAILogicOptions = {}): GenkitPlugin {
  return genkitPlugin(
    'firebase-ai-logic',
    async (ai: Genkit) => {
      try {
        // Initialize Firebase app
        const firebaseApp = initializeFirebaseApp(options);
        
        // Get backend
        const backend = options.backend || 'googleAI';
        const aiBackend = getAIBackend(backend, options.vertexAIRegion);
        
        // Initialize Firebase AI
        const firebaseAI = getAI(firebaseApp, { backend: aiBackend });
        
        // Store globally for resolver to use
        globalFirebaseAI = firebaseAI;
        globalOptions = options;
        
        console.log(`Firebase AI Logic plugin initialized with ${backend} backend`);
        
      } catch (error) {
        throw new GenkitError({
          source: 'firebase-ai-logic-plugin',
          status: 'FAILED_PRECONDITION',
          message: `Failed to initialize Firebase AI Logic plugin: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    },
    // Plugin resolver for dynamic model loading
    async (ai: Genkit, action: string, name: string) => {
      if (action === 'model') {
        try {
          console.log(`Loading model dynamically: ${name}`);
          
          // Use global Firebase AI instance if available, otherwise initialize
          let firebaseAI = globalFirebaseAI;
          let opts = globalOptions;
          
          if (!firebaseAI) {
            const firebaseApp = initializeFirebaseApp(options);
            const backend = options.backend || 'googleAI';
            const aiBackend = getAIBackend(backend, options.vertexAIRegion);
            firebaseAI = getAI(firebaseApp, { backend: aiBackend });
            opts = options;
          }
          
          // Extract the actual model name (remove firebase-ai-logic prefix if present)
          const actualModelName = name.startsWith('firebase-ai-logic/') 
            ? name.replace('firebase-ai-logic/', '') 
            : name;
          
          // Create and register the model with the extracted name
          createFirebaseAILogicModel(ai, actualModelName, firebaseAI, opts);
          console.log(`Model ${name} loaded successfully with actual name: ${actualModelName}`);
          
        } catch (error) {
          console.error(`Failed to dynamically load model ${name}:`, error);
          throw error;
        }
      }
    }
  );
}

// Type-safe plugin interface
export interface FirebaseAILogicPlugin {
  (options?: FirebaseAILogicOptions): GenkitPlugin;
  model(name: string, config?: FirebaseAILogicConfig): ModelReference<typeof FirebaseAILogicConfigSchema>;
}

// Create the plugin with attached model method
const firebaseAILogic = Object.assign(
  createFirebaseAILogicPlugin as FirebaseAILogicPlugin,
  {
    model: (name: string, config?: FirebaseAILogicConfig) =>
      modelRef({
        name: `firebase-ai-logic/${name}`, // Add prefix for the model reference
        configSchema: FirebaseAILogicConfigSchema,
        config
      })
  }
);

export { firebaseAILogic };
export default firebaseAILogic;