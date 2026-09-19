import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    wsHost: import.meta.env.VITE_PUSHER_HOST,
    wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
    wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],

    authorizer: (channel, options) => {
        return {
          authorize: (socketId, callback) => {
            axios.post(`${import.meta.env.VITE_API_URL}/broadcasting/auth`, {
              socket_id: socketId,
              channel_name: channel.name
            }).then(response => {
              callback(null, response.data)
            }).catch(error => {
              callback(error)
            })
          }
        }
    }
});
