export default function sendEvent(ws, event, data) {
  ws.send(JSON.stringify({ event, data }), { binary: false });
}
