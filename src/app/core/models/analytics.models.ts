/**
 * Analytics Models for Questionnaire A/B/C Testing
 * @version 1.0
 */

export type QuestionnaireVariant = 'A' | 'B' | 'C';

export type QuestionnaireEventType =
  | 'questionnaire_loaded'
  | 'questionnaire_started'
  | 'question_viewed'
  | 'question_answered'
  | 'questionnaire_completed'
  | 'questionnaire_abandoned'
  | 'back_navigation_used'
  | 'fiuto_chat_opened'
  | 'fiuto_chat_message_sent'
  | 'recommendation_viewed'
  | 'recommendation_clicked';

export interface QuestionnaireEventEnvelope {
  eventType: QuestionnaireEventType;
  timestamp: number;

  variant: QuestionnaireVariant;
  experimentVersion: number;
  questionnaireVersion: string;

  sessionId: string;
  deviceId: string;

  payload: Record<string, unknown>;
}
