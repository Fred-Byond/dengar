/** Klleon Chat SDK ambient types (UMD global). */

export type KlleonStatus =
  | "IDLE"
  | "CONNECTING"
  | "CONNECTING_FAILED"
  | "SOCKET_CONNECTED"
  | "SOCKET_FAILED"
  | "STREAMING_CONNECTED"
  | "STREAMING_FAILED"
  | "CONNECTED_FINISH"
  | "VIDEO_LOAD"
  | "VIDEO_CAN_PLAY"
  | "DESTROYED"
  | string;

export type KlleonChatType =
  | "ACTIVATE_VOICE"
  | "STT_RESULT"
  | "STT_ERROR"
  | "TEXT"
  | "PREPARING_RESPONSE"
  | "RESPONSE_IS_ENDED"
  | "USER_SPEECH_STARTED"
  | "USER_SPEECH_STOPPED"
  | string;

export interface KlleonChatData {
  message?: string;
  chat_type?: KlleonChatType;
  time?: string;
  id?: string;
}

export interface KlleonErrorData {
  code?: string;
  message?: string;
}

export interface KlleonInitOption {
  sdk_key: string;
  avatar_id: string;
  voice_code?: string;
  subtitle_code?: string;
  voice_tts_speech_speed?: number;
  enable_microphone?: boolean;
  log_level?: "debug" | "info" | "warn" | "error" | "silent";
  custom_id?: string;
  user_key?: string;
}

export interface KlleonChatSdk {
  init: (option: KlleonInitOption) => Promise<void>;
  destroy: () => void;
  onStatusEvent: (cb: (status: KlleonStatus) => void) => void;
  onChatEvent: (cb: (data: KlleonChatData) => void) => void;
  onErrorEvent: (cb: (error: KlleonErrorData) => void) => void;
  sendTextMessage: (message: string) => void;
  startStt: () => void;
  endStt: () => void;
  cancelStt: () => void;
  echo: (message: string) => void;
  stopSpeech: () => void;
  clearMessageList: () => void;
}

declare global {
  interface Window {
    KlleonChat?: KlleonChatSdk;
  }

  namespace JSX {
    interface IntrinsicElements {
      "avatar-container": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          class?: string;
        },
        HTMLElement
      > & {
        volume?: number;
        videoStyle?: React.CSSProperties;
        muted?: boolean;
      };
    }
  }
}

export {};
