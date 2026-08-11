/** HoloMe avatar SDK ambient types (UMD global). */

export type HoloMeStatus =
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

export type HoloMeChatType =
  | "ACTIVATE_VOICE"
  | "STT_RESULT"
  | "STT_ERROR"
  | "TEXT"
  | "PREPARING_RESPONSE"
  | "RESPONSE_IS_ENDED"
  | "USER_SPEECH_STARTED"
  | "USER_SPEECH_STOPPED"
  | string;

export interface HoloMeChatData {
  message?: string;
  chat_type?: HoloMeChatType;
  time?: string;
  id?: string;
}

export interface HoloMeErrorData {
  code?: string;
  message?: string;
}

export interface HoloMeInitOption {
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

export interface HoloMeSdk {
  init: (option: HoloMeInitOption) => Promise<void>;
  destroy: () => void;
  onStatusEvent: (cb: (status: HoloMeStatus) => void) => void;
  onChatEvent: (cb: (data: HoloMeChatData) => void) => void;
  onErrorEvent: (cb: (error: HoloMeErrorData) => void) => void;
  sendTextMessage: (message: string) => void;
  startStt: () => void;
  endStt: () => void;
  cancelStt: () => void;
  echo: (message: string) => void;
  stopSpeech: () => void;
  clearMessageList: () => void;
}

declare global {
  /**
   * The avatar runtime attaches itself to a window global whose name is set by
   * the vendor UMD bundle, so it is read by key at runtime rather than named
   * here. Configure it via NEXT_PUBLIC_HOLOME_RUNTIME_GLOBAL.
   */
  interface Window {
    [avatarRuntimeGlobal: string]: unknown;
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
