import React from "react";

import {
  Bot,
  Send,
  BookOpen,
} from "lucide-react";

export default function AIAssistant() {
  return (
    <div className="panel ai-panel">
      <div className="panel-head">
        <h2>AI Assistant</h2>

        <span className="online">
          <i />
          Online
        </span>
      </div>

      <div className="chat">
        <div className="chat-msg">
          <Bot />

          <span>
            Hello Gaurav! I'm your AI Disaster Management Assistant.
            How can I help you today?
          </span>
        </div>

        <button className="chat-user">
          Show me the current flood situation in Assam.
        </button>

        <div className="chat-msg">
          <Bot />

          <span>
            Here is the latest update for Assam, India.

            <button className="map-link">
              <BookOpen size={14} />
              View on Map
            </button>
          </span>
        </div>
      </div>

      <div className="chat-input">
        <span>Ask anything...</span>

        <button aria-label="Send message">
          <Send size={17} />
        </button>
      </div>
    </div>
  );
}