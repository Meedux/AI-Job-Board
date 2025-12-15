import { NextResponse } from 'next/server';
import { EVENTS, subscribe } from '@/utils/realtime';

export const revalidate = 0;

export function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let closed = false;
      let interval;

      const safeEnqueue = (chunk) => {
        if (closed) return;
        try {
          controller.enqueue(chunk);
        } catch (err) {
          closed = true;
          clearInterval(interval);
        }
      };

      const send = (event, payload) => {
        safeEnqueue(encoder.encode(`event: ${event}\n`));
        safeEnqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      const offNotification = subscribe(EVENTS.NOTIFICATION, (payload) => send('notification', payload));
      const offMessage = subscribe(EVENTS.MESSAGE, (payload) => send('message', payload));

      safeEnqueue(encoder.encode('event: ping\ndata: start\n\n'));
      interval = setInterval(() => {
        safeEnqueue(encoder.encode('event: ping\ndata: alive\n\n'));
      }, 25000);

      controller.oncancel = () => {
        if (closed) return;
        closed = true;
        clearInterval(interval);
        offNotification();
        offMessage();
      };
    }
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
}
