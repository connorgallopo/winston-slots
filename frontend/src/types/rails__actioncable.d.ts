declare module '@rails/actioncable' {
  export interface Channel {
    perform(action: string, data?: any): void;
    send(data: any): void;
  }

  export interface Subscription extends Channel {
    unsubscribe(): void;
  }

  export interface Subscriptions {
    create(channel: string | { channel: string; [key: string]: any }, callbacks?: {
      connected?(): void;
      disconnected?(): void;
      received?(data: any): void;
      rejected?(): void;
    }): Subscription;
  }

  export interface Consumer {
    subscriptions: Subscriptions;
    connect(): void;
    disconnect(): void;
    send(data: any): void;
  }

  export function createConsumer(url?: string): Consumer;
}
