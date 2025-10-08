import { ChatAnthropic } from "@langchain/anthropic";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { tool } from "@langchain/core/tools";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { OpenAIEmbeddings } from "@langchain/openai";
import { z } from "zod";
import connectDB from "./mongodb";

export async function callAgent(query: string, thread_id: string) {
  const { db, client, dbName } = await connectDB();
  const collection = db.collection("properties");

  // Graph state definition
  const GraphState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({ reducer: (x, y) => x.concat(y) }),
  });

  // Property lookup tool
  const propertyLookupTool = tool(
    async ({ query, n = 10 }: { query: string; n?: number }) => {
      const vectorStore = new MongoDBAtlasVectorSearch(new OpenAIEmbeddings(), {
        collection,
        indexName: "property-index",
        textKey: "pageContent",
        embeddingKey: "embedding",
      });
      const results = await vectorStore.similaritySearch(query, n);
      return JSON.stringify(results);
    },
    {
      name: "property_lookup",
      description:
        "Find relevant properties based on a query. Input: JSON with 'query' and optional 'n' (number of results).",
      schema: z.object({
        query: z.string().describe("The search query for properties."),
        n: z
          .number()
          .optional()
          .default(10)
          .describe("Number of results to return, default 10."),
      }),
    }
  );

  const tools = [propertyLookupTool];
  const toolNode = new ToolNode<typeof GraphState.State>(tools);

  const model = new ChatAnthropic({
    model: "claude-4-sonnet-20250514",
    temperature: 0,
    maxTokens: 1000,
  }).bindTools(tools);

  // Model call node
  async function callModel(state: typeof GraphState.State) {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a helpful AI real estate assistant collaborating with other assistants. Use the provided tools to progress towards answering the question. If you are unable to fully answer, that's OK, another assistant with different tools will help where you left off. Execute what you can to make progress. If you or any of the other assistants have the final answer or deliverable, prefix your response with FINAL ANSWER so the team knows to stop. You have access to the following tools: {tool_names}.\n{system_message}\nCurrent time: {time}.`,
      ],
      new MessagesPlaceholder("messages"),
    ]);
    const formattedPrompt = await prompt.formatMessages({
      tool_names: tools.map((t) => t.name).join(", "),
      system_message: `You are a helpful AI real estate assistant.`,
      time: new Date().toISOString(),
      messages: state.messages,
    });
    const response = await model.invoke(formattedPrompt);
    return { messages: [response] };
  }

  // Workflow control
  function shouldContinue(state: typeof GraphState.State) {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
    return lastMessage.tool_calls?.length ? "tools" : "__end__";
  }

  // Build workflow
  const workflow = new StateGraph(GraphState)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  const checkpointer = new MongoDBSaver({ client, dbName });
  const app = workflow.compile({ checkpointer });

  const finalState = await app.invoke(
    { messages: [new HumanMessage(query)] },
    { recursionLimit: 15, configurable: { thread_id } }
  );

  // Optionally close the client connection if not reused elsewhere
  // await client.close();

  return finalState.messages[finalState.messages.length - 1].content;
}
