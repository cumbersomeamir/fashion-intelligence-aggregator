import type { Request, Response } from "express";
import * as chatService from "../services/chatService.js";

interface ChatBody {
  message?: string;
  topic?: string;
}

export function postChat(req: Request, res: Response): void {
  const { message = "", topic: suggestedTopic } = (req.body as ChatBody) ?? {};
  const topic = suggestedTopic ?? chatService.inferTopic(message);
  const result = chatService.getMockChatResponse(message, topic);
  res.json({
    message: result.response,
    topic: result.topic,
    citations: result.citations,
  });
}
